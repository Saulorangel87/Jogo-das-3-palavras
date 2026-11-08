import { useEffect, useState } from 'react';
import { tocarJingle } from '../audio/motor.js';
import Fundo from '../fundos/Fundo.jsx';
import { PERSONAGENS } from '../data/personagens.js';
import { useFoco, useVoltar } from '../navegacao/useNavegacao.js';
import {
  formatarCodigo,
  linkDoConvite,
  mensagemDeErro,
  teclasDoCodigo,
} from '../online/mensagens.js';
import { temVagaGuardada, useSalaOnline } from '../online/useSalaOnline.js';
import Personagem from '../personagens/Personagem.jsx';
import Jogo from './Jogo.jsx';
import Resultado from './Resultado.jsx';
import './Online.css';

const NIVEIS = [
  { id: 'iniciante', nome: 'Iniciante', descricao: 'Palavras curtas e poucas letras' },
  { id: 'intermediario', nome: 'Intermediário', descricao: 'Palavras maiores' },
  { id: 'avancado', nome: 'Avançado', descricao: 'Frases com dica' },
];
const ROTULO_DA_PRESENCA = { conectada: 'Online', reconectando: 'Reconectando...', saiu: 'Saiu' };

function Aviso({ codigo }) {
  return codigo ? <p className="online-aviso" role="alert">{mensagemDeErro(codigo)}</p> : null;
}

function EscolhaDePersonagem({ titulo, ocupados = [], aoEscolher }) {
  return (
    <>
      <h1 className="titulo">{titulo}</h1>
      <div className="grade grade-2 grade-4-larga">
        {PERSONAGENS.map((p) => (
          <button
            key={p.id}
            className="botao config-personagem"
            disabled={ocupados.includes(p.id)}
            onClick={() => aoEscolher(p)}
          >
            <Personagem personagem={p} />
            <span>{p.nome}</span>
          </button>
        ))}
      </div>
    </>
  );
}

// O código é digitado por botões: nunca há campo de texto livre.
function DigitarCodigo({ aoCompletar }) {
  const [digitado, setDigitado] = useState('');
  useFoco(`codigo-${digitado.length === 4 || digitado.length === 0 ? digitado.length : 'meio'}`);

  function digitar(tecla) {
    const novo = digitado + tecla;
    setDigitado(novo);
    if (novo.length === 6) aoCompletar(formatarCodigo(novo));
  }

  return (
    <>
      <h1 className="titulo">Qual é o código da sala?</h1>
      <p className="online-codigo" aria-live="polite">{formatarCodigo(digitado) || '____-__'}</p>
      <div className="online-teclas">
        {teclasDoCodigo(digitado).map((tecla) => (
          <button key={tecla} className="botao online-tecla" onClick={() => digitar(tecla)}>{tecla}</button>
        ))}
        <button className="botao botao-secundario" disabled={!digitado} onClick={() => setDigitado(digitado.slice(0, -1))}>
          Apagar
        </button>
      </div>
    </>
  );
}

function SalaDeEspera({ sala, aoComecar, aoSair, aviso }) {
  const [copiado, setCopiado] = useState(false);
  const link = linkDoConvite(window.location.origin, sala.codigo);
  const anfitria = sala.anfitriaoId === sala.voceId;
  const podeComecar = sala.jogadores.length >= 2;

  useFoco(`espera-${anfitria}-${podeComecar}`);

  async function convidar() {
    try {
      if (navigator.share) {
        await navigator.share({ title: '3 Palavras', text: 'Vem jogar 3 Palavras comigo!', url: link });
      } else {
        await navigator.clipboard.writeText(link);
        setCopiado(true);
      }
    } catch {
      // Cancelou o compartilhamento, ou o navegador não deixou: o link continua na tela.
    }
  }

  return (
    <>
      <h1 className="titulo">Sala de espera</h1>
      <p className="online-codigo">{sala.codigo}</p>
      <p className="online-link">{link}</p>
      <p className="online-explicacao">Mande este convite só para quem você conhece.</p>
      <ul className="online-jogadoras">
        {sala.jogadores.map((j) => (
          <li key={j.id} className="online-jogadora">
            <Personagem personagem={j} expressao="normal" />
            <span>{j.nome}{j.id === sala.voceId ? ' (você)' : ''}</span>
            <small className={`online-presenca online-presenca-${j.conexao}`}>{ROTULO_DA_PRESENCA[j.conexao]}</small>
          </li>
        ))}
      </ul>
      <Aviso codigo={aviso} />
      {!anfitria && <p className="online-explicacao">Quem criou a sala começa a partida.</p>}
      {anfitria && !podeComecar && <p className="online-explicacao">Esperando alguém entrar...</p>}
      <div className="online-botoes">
        {anfitria && (
          <button className="botao" disabled={!podeComecar} data-foco-inicial={podeComecar ? '' : undefined} onClick={aoComecar}>
            Começar
          </button>
        )}
        <button className="botao botao-secundario" data-foco-inicial={!podeComecar ? '' : undefined} onClick={convidar}>
          {copiado ? 'Link copiado!' : 'Convidar'}
        </button>
        <button className="botao botao-secundario" onClick={aoSair}>Sair</button>
      </div>
    </>
  );
}

export default function Online({ codigoInicial, aoVoltar, aoMudarPartida }) {
  const online = useSalaOnline();
  const { sala, conexao } = online;
  const [passo, setPasso] = useState(codigoInicial && !temVagaGuardada() ? 'consultando' : 'menu');
  const [nivel, setNivel] = useState(null);
  const [codigo, setCodigo] = useState(codigoInicial);
  const [ocupados, setOcupados] = useState([]);
  const [erro, setErro] = useState(null);

  const partida = sala ? sala.partida : null;
  useEffect(() => {
    aoMudarPartida(partida);
  }, [partida, aoMudarPartida]);
  useEffect(() => () => aoMudarPartida(null), [aoMudarPartida]);

  async function consultar(alvo) {
    setErro(null);
    const resposta = await online.consultar(alvo);
    if (!resposta.ok) {
      setErro(resposta.erro);
      setPasso(resposta.erro === 'sem-resposta' ? 'menu' : 'codigo');
      return;
    }
    setCodigo(alvo);
    setOcupados(resposta.ocupados);
    setPasso('personagem-entrar');
  }

  // O link do convite consulta a sala assim que a conexão abre.
  useEffect(() => {
    if (passo === 'consultando' && conexao === 'conectada') consultar(codigoInicial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passo, conexao]);

  async function criar(personagem) {
    tocarJingle(personagem.id);
    const resposta = await online.criar(nivel, personagem.id);
    if (!resposta.ok) setErro(resposta.erro);
  }

  async function entrar(personagem) {
    tocarJingle(personagem.id);
    const resposta = await online.entrar(codigo, personagem.id);
    if (resposta.ok) return;
    setErro(resposta.erro);
    if (resposta.erro === 'personagem-ocupado') consultar(codigo);
    else setPasso('codigo');
  }

  async function sair() {
    await online.sair();
    aoVoltar();
  }

  function voltar() {
    setErro(null);
    if (passo === 'personagem-criar') setPasso('nivel');
    else if (passo === 'menu') aoVoltar();
    else setPasso('menu');
  }

  useFoco(`online-${passo}-${Boolean(sala)}-${conexao}-${ocupados.join()}`);
  useVoltar(sala ? null : voltar);

  if (sala && sala.partida && sala.fase === 'fim') {
    return <Resultado estado={sala.partida} aoInicio={sair} />;
  }
  if (sala && sala.partida) {
    return (
      <>
        <Jogo
          estado={sala.partida}
          despachar={online.jogar}
          aoSair={sair}
          online={{
            voceId: sala.voceId,
            giro: sala.giro,
            jogadores: sala.jogadores,
            esperaNaVezMs: sala.esperaNaVezMs,
            tempoDaVezMs: sala.tempoDaVezMs,
            prontos: sala.prontos,
            esperaProximoMs: sala.esperaProximoMs,
            conexao,
          }}
        />
        {conexao !== 'conectada' && <p className="online-faixa" role="status">Sua internet caiu. Reconectando...</p>}
      </>
    );
  }

  return (
    <main className="tela">
      <Fundo tipo="configuracao" />
      {conexao === 'sem-rede' && !sala && <p className="online-aviso" role="alert">{mensagemDeErro('sem-resposta')}</p>}
      {conexao === 'reconectando' && <p className="online-faixa" role="status">Sua internet caiu. Reconectando...</p>}

      {sala && (
        <SalaDeEspera
          sala={sala}
          aviso={erro}
          aoSair={sair}
          aoComecar={async () => {
            const resposta = await online.comecar();
            setErro(resposta.ok ? null : resposta.erro);
          }}
        />
      )}

      {!sala && (
        <>
          <Aviso codigo={erro || online.aviso} />
          {passo === 'menu' && (
            <>
              <h1 className="titulo">Jogar online</h1>
              <p className="online-explicacao">Cada pessoa joga no seu aparelho, em uma sala privada.</p>
              <div className="grade grade-2">
                <button className="botao config-opcao" data-foco-inicial disabled={conexao !== 'conectada'} onClick={() => { setErro(null); online.limparAviso(); setPasso('nivel'); }}>
                  Criar sala
                  <small>Você recebe um convite para mandar</small>
                </button>
                <button className="botao config-opcao" disabled={conexao !== 'conectada'} onClick={() => { setErro(null); online.limparAviso(); setPasso('codigo'); }}>
                  Entrar em uma sala
                  <small>Com o código que você recebeu</small>
                </button>
              </div>
            </>
          )}
          {passo === 'consultando' && <h1 className="titulo">Procurando a sala...</h1>}
          {passo === 'nivel' && (
            <>
              <h1 className="titulo">Qual é o nível?</h1>
              <div className="grade grade-3-larga">
                {NIVEIS.map((n, i) => (
                  <button key={n.id} className="botao config-opcao" data-foco-inicial={i === 0 ? '' : undefined} onClick={() => { setNivel(n.id); setPasso('personagem-criar'); }}>
                    {n.nome}
                    <small>{n.descricao}</small>
                  </button>
                ))}
              </div>
            </>
          )}
          {passo === 'personagem-criar' && <EscolhaDePersonagem titulo="Escolha seu personagem" aoEscolher={criar} />}
          {passo === 'personagem-entrar' && <EscolhaDePersonagem titulo="Escolha seu personagem" ocupados={ocupados} aoEscolher={entrar} />}
          {passo === 'codigo' && <DigitarCodigo aoCompletar={consultar} />}
          <button className="botao botao-secundario rodape" onClick={voltar}>Voltar</button>
        </>
      )}
    </main>
  );
}

import { useEffect, useRef, useState } from 'react';
import Estrelas from '../componentes/Estrelas.jsx';
import Painel from '../componentes/Painel.jsx';
import { atrasoDaCelebracao } from '../componentes/celebracao.js';
import { DURACAO_GIRO } from '../componentes/giro.js';
import Roleta, { GRAUS, proximoAngulo } from '../componentes/Roleta.jsx';
import Teclado from '../componentes/Teclado.jsx';
import {
  ACOES,
  FASES,
  JOGADAS,
  JOGADAS_BOAS,
  MODOS,
  indiceDaFatia,
  multiplicadorAtual,
  painelAtual,
  podeEscolherLetra,
  podeGirar,
  temRelogio,
} from '../logica/jogo.js';
import { ESTRELAS_MAXIMAS_POR_PAINEL, TEMPO_DA_VEZ_S } from '../logica/regras.js';
import { contarCasasFechadas, montarResposta } from '../logica/texto.js';
import { useFoco, useVoltar } from '../navegacao/useNavegacao.js';
import { textoDeQuemSaiu } from '../online/mensagens.js';
import BotaoSom from '../audio/BotaoSom.jsx';
import PainelSom from '../audio/PainelSom.jsx';
import { tocarEfeito } from '../audio/motor.js';
import { useEfeitosDoJogo } from '../audio/useEfeitosDoJogo.js';
import Personagem from '../personagens/Personagem.jsx';
import { expressaoNoJogo } from '../personagens/expressao.js';
import Fundo from '../fundos/Fundo.jsx';
import './Jogo.css';

// Nos últimos segundos da vez o relógio muda de cor e faz um tique por segundo.
const SEGUNDOS_DE_AVISO = 5;
// O botão de seguir nasce onde estava a resposta: um toque duplo não pode pular a palavra.
const ESPERA_PARA_SEGUIR_MS = 1000;

function textoDaJogada(jogada, competitivo) {
  if (!jogada) return null;
  if (jogada.tipo === JOGADAS.LETRA_ERRADA) {
    return jogada.protegida
      ? `Não tem a letra ${jogada.letra}, mas o escudo guardou a sua vez!`
      : `Não tem a letra ${jogada.letra}.`;
  }
  if (jogada.tipo === JOGADAS.TEMPO_ESGOTADO) return 'Acabou o tempo!';
  if (jogada.tipo === JOGADAS.BONUS) return 'Bônus! A próxima letra certa vale em dobro. Gire de novo!';
  if (jogada.tipo === JOGADAS.GIRO_EXTRA) return 'Giro extra! Gire de novo.';
  if (jogada.tipo === JOGADAS.ESCUDO) return 'Escudo! Se errar uma letra, você não perde a vez. Gire de novo!';
  if (jogada.tipo === JOGADAS.SONECA) return 'Soneca! A vez passa, sem perder pontos.';
  if (jogada.tipo === JOGADAS.CHUTE_ERRADO) {
    // Online, o servidor não repassa o que foi digitado casa a casa.
    return jogada.resposta ? `Não é ${jogada.resposta}.` : 'Essa não é a resposta.';
  }
  const casas = jogada.quantidade === 1 ? '1 letra' : `${jogada.quantidade} letras`;
  const pontos = competitivo ? ` +${jogada.pontos} pontos!` : '';
  const bonus = jogada.bonus ? ' (bônus ×2)' : '';
  const gratis = jogada.gratis ? 'Letra grátis! ' : '';
  return `${gratis}Tem ${casas} ${jogada.letra}!${pontos}${bonus}`;
}

function textoDaInstrucao(estado, nome, girando, minhaVez) {
  if (girando) return `${nome} está girando a roleta...`;
  if (!minhaVez) return `Vez de ${nome}.`;
  if (estado.modo === MODOS.COOPERATIVO) return `${nome}, escolha uma letra ou resolva.`;
  if (estado.valorRoleta !== null) {
    return `${nome}, vale ${estado.valorRoleta} por letra. Escolha uma letra.`;
  }
  return `${nome}, gire a roleta ou resolva.`;
}

// Conta de 1 em 1 segundo a partir do tempo que o servidor informou.
// `chave` recomeça a contagem mesmo quando o tempo informado é igual ao anterior (vez nova com 30 s).
function useSegundosRestantes(ms, chave) {
  const [segundos, setSegundos] = useState(null);
  useEffect(() => {
    if (ms === null || ms === undefined) {
      setSegundos(null);
      return undefined;
    }
    const fim = Date.now() + ms;
    const atualizar = () => setSegundos(Math.max(0, Math.ceil((fim - Date.now()) / 1000)));
    atualizar();
    const relogio = setInterval(atualizar, 1000);
    return () => clearInterval(relogio);
  }, [ms, chave]);
  return segundos;
}

// `online` só existe na partida pela internet: o estado vem do servidor, e `despachar` pede a jogada a ele.
export default function Jogo({ estado, despachar, aoSair, online = null }) {
  // Estado só de interface: a regra continua toda em src/logica/.
  const [aberto, setAberto] = useState(null); // null, 'resolver' ou 'sair'
  const [girando, setGirando] = useState(false);
  const [angulo, setAngulo] = useState(0);
  const [digitadas, setDigitadas] = useState([]);

  const competitivo = estado.modo === MODOS.COMPETITIVO;
  const painel = painelAtual(estado);
  const resolvido = estado.fase === FASES.RESOLVIDO;
  const jogadorDaVez = estado.jogadores[estado.vez];
  const totalPaineis = estado.paineis.length;
  const ultimo = estado.indicePainel === totalPaineis - 1;
  const minhaVez = !online || jogadorDaVez.id === online.voceId;
  const prontos = online ? online.prontos : [];
  const jaSegui = Boolean(online) && prontos.includes(online.voceId);
  const faltamSeguir = online
    ? online.jogadores.filter((j) => j.conexao !== 'saiu' && !prontos.includes(j.id)).map((j) => j.nome)
    : [];
  const segundosDaVez = useSegundosRestantes(online ? online.esperaNaVezMs : null);
  const segundosParaSeguir = useSegundosRestantes(online && resolvido ? online.esperaProximoMs : null);
  // Online, o servidor manda o tempo que resta. No jogo local, o aparelho conta os 30 segundos.
  const comRelogio = temRelogio(estado);
  const msDaVezRelogio = online ? online.tempoDaVezMs : comRelogio ? TEMPO_DA_VEZ_S * 1000 : null;
  const segundosRelogio = useSegundosRestantes(comRelogio ? msDaVezRelogio : null, estado.turno);
  const quemSaiu = online ? estado.jogadores.filter((j) => j.saiu).map((j) => j.nome) : [];
  const podeLetra = podeEscolherLetra(estado) && !girando && minhaVez;
  // A letra grátis só aparece quando a roleta para: antes disso ela entregaria o resultado do giro.
  const letraGratis = estado.ultimaJogada && estado.ultimaJogada.gratis ? estado.ultimaJogada.letra : null;
  const letrasVisiveis =
    girando && letraGratis ? estado.letrasUsadas.filter((l) => l !== letraGratis) : estado.letrasUsadas;
  const comOpcoes = Boolean(painel.opcoes);
  const opcoesDisponiveis = comOpcoes
    ? painel.opcoes.filter((o) => !estado.descartadas.includes(o))
    : [];
  const preenchendo = aberto === 'resolver' && !comOpcoes && !resolvido;
  const totalFechadas = contarCasasFechadas(painel.texto, estado.letrasUsadas);
  const completo = digitadas.length === totalFechadas;

  useEffect(() => {
    if (!girando) return undefined;
    const temporizador = setTimeout(() => setGirando(false), DURACAO_GIRO);
    return () => clearTimeout(temporizador);
  }, [girando]);

  useEfeitosDoJogo(estado);

  // Jogo local: quando o tempo acaba, a vez passa. Cada turno novo cancela e recomeça este prazo.
  useEffect(() => {
    if (online || !comRelogio) return undefined;
    const prazo = setTimeout(() => despachar({ tipo: ACOES.TEMPO_ESGOTADO }), TEMPO_DA_VEZ_S * 1000);
    return () => clearTimeout(prazo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [online, comRelogio, estado.turno]);

  // Se a vez passou por tempo enquanto o painel de resolver estava aberto, ele fecha.
  useEffect(() => {
    setDigitadas([]);
    setAberto((atual) => (atual === 'resolver' ? null : atual));
  }, [estado.vez, estado.indicePainel]);

  // Tique nos últimos segundos, só para quem está na vez (os outros veem o relógio mudar de cor).
  useEffect(() => {
    if (segundosRelogio !== null && segundosRelogio > 0 && segundosRelogio <= SEGUNDOS_DE_AVISO && minhaVez) {
      tocarEfeito('tique');
    }
  }, [segundosRelogio, minhaVez]);

  const resolvidoEm = useRef(0);
  useEffect(() => {
    if (resolvido) resolvidoEm.current = Date.now();
  }, [resolvido]);

  function seguir() {
    if (Date.now() - resolvidoEm.current < ESPERA_PARA_SEGUIR_MS) return;
    despachar({ tipo: ACOES.PROXIMO_PAINEL });
  }

  // Online, todos os aparelhos giram a roleta quando o servidor avisa, para a mesma fatia.
  const numeroDoGiro = online && online.giro ? online.giro.numero : 0;
  const giroVisto = useRef(numeroDoGiro);
  useEffect(() => {
    if (numeroDoGiro === giroVisto.current) return;
    giroVisto.current = numeroDoGiro;
    animarGiro(online.giro.fatia);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numeroDoGiro]);

  // Se a vez passou enquanto o painel de resolver estava aberto, ele fecha.
  useEffect(() => {
    if (minhaVez) return;
    setDigitadas([]);
    setAberto((atual) => (atual === 'resolver' ? null : atual));
  }, [minhaVez]);

  useFoco(
    [
      estado.indicePainel,
      estado.fase,
      estado.vez,
      estado.valorRoleta,
      estado.letrasUsadas.length,
      estado.descartadas.length,
      girando,
      aberto,
      jaSegui,
    ].join('-'),
  );
  useVoltar(() => {
    if (preenchendo && digitadas.length > 0) setDigitadas(digitadas.slice(0, -1));
    else fecharOuPerguntar();
  });

  function fecharOuPerguntar() {
    setDigitadas([]);
    setAberto(aberto ? null : 'sair');
  }

  function animarGiro(fatia) {
    const novoAngulo = proximoAngulo(angulo, fatia);
    // Um tique por divisão de fatia que passa pelo ponteiro.
    tocarEfeito('giro', { tiques: Math.round((novoAngulo - angulo) / GRAUS), duracao: DURACAO_GIRO });
    setAngulo(novoAngulo);
    setGirando(true);
  }

  function girar() {
    if (online) {
      despachar({ tipo: ACOES.GIRAR });
      return;
    }
    const sorteio = Math.random();
    animarGiro(indiceDaFatia(sorteio));
    despachar({ tipo: ACOES.GIRAR, sorteio, sorteioLetra: Math.random() });
  }

  function resolver(resposta) {
    setAberto(null);
    setDigitadas([]);
    despachar({ tipo: ACOES.RESOLVER, resposta });
  }

  const jogada = textoDaJogada(estado.ultimaJogada, competitivo);
  const jogadaRuim = estado.ultimaJogada && !JOGADAS_BOAS.has(estado.ultimaJogada.tipo);

  return (
    <main className="tela jogo">
      <Fundo tipo="jogo" variante={estado.modo} />
      <header className="jogo-topo">
        <span className="jogo-topo-texto">
          <span className="jogo-tema">{estado.tema}</span>
          <span className="jogo-painel-num">
            <span className="jogo-separador">{' · '}</span>
            <span className="jogo-longo">
              Painel {estado.indicePainel + 1} de {totalPaineis}
              {competitivo && ` · pontos ×${multiplicadorAtual(estado)}`}
            </span>
            <span className="jogo-curto" aria-hidden="true">
              Painel {estado.indicePainel + 1}/{totalPaineis}
              {competitivo && ` · ×${multiplicadorAtual(estado)}`}
            </span>
          </span>
        </span>
        <div className="jogo-topo-botoes">
          <BotaoSom
            className="jogo-sair"
            aoAbrir={() => {
              setDigitadas([]);
              setAberto('som');
            }}
          />
          <button
            className="botao botao-secundario jogo-sair"
            disabled={girando}
            onClick={() => {
              setDigitadas([]);
              setAberto('sair');
            }}
          >
            Sair
          </button>
        </div>
      </header>

      <ul className="jogo-placar">
        {estado.jogadores.map((j, i) => (
          <li key={j.id} className={i === estado.vez ? 'jogo-jogador jogo-jogador-vez' : 'jogo-jogador'}>
            <Personagem personagem={j} expressao={expressaoNoJogo(estado, i)} />
            <span className="jogo-nome">
              {j.nome}
              {online && j.id === online.voceId && ' (você)'}
              {j.saiu && ' (saiu)'}
              {!j.saiu && online && online.jogadores.find((o) => o.id === j.id)?.conexao === 'reconectando' && ' (reconectando)'}
            </span>
            {competitivo && <strong>{j.pontos}</strong>}
            {j.bonus && <span className="jogo-ficha" title="A próxima letra certa vale em dobro">×2</span>}
            {j.escudo && <span className="jogo-ficha" title="A próxima letra errada não passa a vez">Escudo</span>}
          </li>
        ))}
      </ul>
      {!competitivo && (
        <p className="jogo-equipe">Estrelas da equipe: {estado.estrelas} de {totalPaineis * ESTRELAS_MAXIMAS_POR_PAINEL}</p>
      )}

      <Painel
        texto={painel.texto}
        letrasUsadas={letrasVisiveis}
        aberto={resolvido}
        atraso={atrasoDaCelebracao(estado)}
        digitadas={preenchendo ? digitadas : null}
      />

      <p className="jogo-dica">
        {painel.emoji && <span className="jogo-emoji" role="img" aria-label="Dica">{painel.emoji}</span>}
        {painel.dica && <span>Dica: {painel.dica}</span>}
      </p>

      {!resolvido && segundosRelogio !== null && (
        <div
          className={segundosRelogio <= SEGUNDOS_DE_AVISO ? 'jogo-relogio jogo-relogio-curto' : 'jogo-relogio'}
          role="timer"
          aria-label={`Tempo da vez: ${segundosRelogio} segundos`}
        >
          <div className="jogo-relogio-barra" aria-hidden="true">
            <div
              className="jogo-relogio-enchimento"
              style={{ width: `${Math.min(100, (segundosRelogio / TEMPO_DA_VEZ_S) * 100)}%` }}
            />
          </div>
          <span className="jogo-relogio-numero" aria-hidden="true">{segundosRelogio} s</span>
        </div>
      )}

      {resolvido && (
        <>
          <p className="jogo-acerto" role="status">
            {competitivo
              ? `${jogadorDaVez.nome} resolveu! +${estado.ganho} pontos`
              : 'Vocês resolveram! '}
            {!competitivo && <Estrelas quantidade={estado.ganho} />}
          </p>
          {jaSegui ? (
            <p className="jogo-instrucao">Esperando {faltamSeguir.join(', ')}...</p>
          ) : (
            <button className="botao jogo-proximo" data-foco-inicial onClick={seguir}>
              {ultimo ? 'Ver resultado' : 'Próximo painel'}
            </button>
          )}
          {segundosParaSeguir !== null && (
            <p className={jaSegui ? 'jogo-instrucao' : 'jogo-instrucao jogo-falta-voce'}>
              {!jaSegui && prontos.length > 0 && faltamSeguir.length === 1 && 'Só falta você clicar! '}
              O jogo segue sozinho em {segundosParaSeguir} s.
            </p>
          )}
        </>
      )}

      {preenchendo && (
        <div className="jogo-resolver" data-modal>
          <h2 className="jogo-resolver-titulo">Complete as casas. Os acentos entram sozinhos.</h2>
          <div className="jogo-acoes">
            <div className="jogo-botoes jogo-botoes-preencher">
              <button
                className="botao jogo-confirmar"
                disabled={!completo}
                data-foco-inicial={completo ? '' : undefined}
                onClick={() => resolver(montarResposta(painel.texto, estado.letrasUsadas, digitadas))}
              >
                Confirmar
              </button>
              <button
                className="botao botao-secundario"
                disabled={digitadas.length === 0}
                onClick={() => setDigitadas(digitadas.slice(0, -1))}
              >
                Apagar
              </button>
              <button className="botao botao-secundario" onClick={fecharOuPerguntar}>
                Voltar
              </button>
            </div>
            <Teclado
              letras={painel.letras}
              usadas={estado.letrasUsadas}
              texto={painel.texto}
              habilitado={!completo}
              focoInicial={!completo}
              aoEscolher={(letra) => setDigitadas([...digitadas, letra])}
            />
          </div>
        </div>
      )}

      {!resolvido && aberto === 'resolver' && comOpcoes && (
        <div className="jogo-resolver" data-modal>
          <h2 className="jogo-resolver-titulo">Qual é a resposta?</h2>
          <div className="grade jogo-resolver-opcoes">
            {painel.opcoes.map((opcao) => {
              const riscada = estado.descartadas.includes(opcao);
              return (
                <button
                  key={opcao}
                  className={riscada ? 'botao jogo-opcao jogo-opcao-riscada' : 'botao jogo-opcao'}
                  disabled={riscada}
                  data-foco-inicial={opcao === opcoesDisponiveis[0] ? '' : undefined}
                  onClick={() => resolver(opcao)}
                >
                  {opcao}
                </button>
              );
            })}
          </div>
          <button className="botao botao-secundario rodape-curto" onClick={() => setAberto(null)}>
            Voltar
          </button>
        </div>
      )}

      {!resolvido && aberto !== 'resolver' && (
        <>
          <div role="status" className="jogo-mensagens">
            {/* A linha da jogada fica sempre desenhada, mesmo vazia: se ela aparecesse e sumisse, a roleta e o
                teclado pulariam para cima e para baixo a cada giro e a cada letra. */}
            <p className={jogada && !girando ? (jogadaRuim ? 'jogo-jogada jogo-jogada-ruim' : 'jogo-jogada jogo-jogada-boa') : 'jogo-jogada'}>
              {jogada && !girando ? jogada : '\u00a0'}
            </p>
            <p className="jogo-instrucao">{textoDaInstrucao(estado, jogadorDaVez.nome, girando, minhaVez)}</p>
            {segundosDaVez !== null && (
              <p className="jogo-instrucao">{jogadorDaVez.nome} caiu. Se não voltar em {segundosDaVez} s, a vez passa.</p>
            )}
            {quemSaiu.length > 0 && <p className="jogo-instrucao">{textoDeQuemSaiu(estado.jogadores, false)}</p>}
          </div>

          <div className="jogo-acoes">
            <div className="jogo-comandos">
              {competitivo && <Roleta angulo={angulo} duracao={DURACAO_GIRO} />}
              <div className="jogo-botoes">
                {competitivo && (
                  <button
                    className="botao jogo-girar"
                    disabled={!podeGirar(estado) || girando || !minhaVez}
                    data-foco-inicial={podeGirar(estado) && minhaVez ? '' : undefined}
                    onClick={girar}
                  >
                    Girar
                  </button>
                )}
                <button
                  className="botao botao-secundario jogo-resolver-botao"
                  disabled={girando || !minhaVez}
                  onClick={() => setAberto('resolver')}
                >
                  Resolver
                </button>
              </div>
            </div>
            <Teclado
              letras={painel.letras}
              usadas={letrasVisiveis}
              texto={painel.texto}
              habilitado={podeLetra}
              focoInicial={podeLetra}
              aoEscolher={(letra) => despachar({ tipo: ACOES.ESCOLHER_LETRA, letra })}
            />
          </div>
        </>
      )}

      {aberto === 'som' && <PainelSom aoFechar={() => setAberto(null)} />}

      {aberto === 'sair' && (
        <div className="jogo-modal" data-modal role="dialog" aria-modal="true" aria-labelledby="titulo-sair">
          <div className="jogo-modal-caixa">
            <h2 id="titulo-sair">Sair da partida?</h2>
            <div className="grade grade-2 jogo-modal-botoes">
              <button className="botao" data-foco-inicial onClick={() => setAberto(null)}>Continuar</button>
              <button className="botao botao-secundario" onClick={aoSair}>Sair</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

import { useEffect, useState } from 'react';
import Estrelas from '../componentes/Estrelas.jsx';
import Painel from '../componentes/Painel.jsx';
import Roleta, { proximoAngulo } from '../componentes/Roleta.jsx';
import Teclado from '../componentes/Teclado.jsx';
import {
  ACOES,
  FASES,
  JOGADAS,
  MODOS,
  indiceDaFatia,
  multiplicadorAtual,
  painelAtual,
  podeEscolherLetra,
  podeGirar,
} from '../logica/jogo.js';
import { contarCasasFechadas, montarResposta } from '../logica/texto.js';
import { useFoco, useVoltar } from '../navegacao/useNavegacao.js';
import Personagem from '../personagens/Personagem.jsx';
import { expressaoNoJogo } from '../personagens/expressao.js';
import './Jogo.css';

const DURACAO_GIRO = 2600;

function textoDaJogada(jogada, competitivo) {
  if (!jogada) return null;
  if (jogada.tipo === JOGADAS.LETRA_ERRADA) return `Não tem a letra ${jogada.letra}.`;
  if (jogada.tipo === JOGADAS.CHUTE_ERRADO) return `Não é ${jogada.resposta}.`;
  const casas = jogada.quantidade === 1 ? '1 letra' : `${jogada.quantidade} letras`;
  const pontos = competitivo ? ` +${jogada.pontos} pontos!` : '';
  return `Tem ${casas} ${jogada.letra}!${pontos}`;
}

function textoDaInstrucao(estado, nome, girando) {
  if (girando) return `${nome} está girando a roleta...`;
  if (estado.modo === MODOS.COOPERATIVO) return `${nome}, escolha uma letra ou resolva.`;
  if (estado.valorRoleta !== null) {
    return `${nome}, vale ${estado.valorRoleta} por letra. Escolha uma letra.`;
  }
  return `${nome}, gire a roleta ou resolva.`;
}

export default function Jogo({ estado, despachar, aoSair }) {
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
  const podeLetra = podeEscolherLetra(estado) && !girando;
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

  function girar() {
    const sorteio = Math.random();
    setAngulo(proximoAngulo(angulo, indiceDaFatia(sorteio)));
    setGirando(true);
    despachar({ tipo: ACOES.GIRAR, sorteio });
  }

  function resolver(resposta) {
    setAberto(null);
    setDigitadas([]);
    despachar({ tipo: ACOES.RESOLVER, resposta });
  }

  const jogada = textoDaJogada(estado.ultimaJogada, competitivo);
  const jogadaRuim =
    estado.ultimaJogada && estado.ultimaJogada.tipo !== JOGADAS.LETRA_CERTA;

  return (
    <main className="tela jogo">
      <header className="jogo-topo">
        <span>
          {estado.tema} · Painel {estado.indicePainel + 1} de {totalPaineis}
          {competitivo && ` · pontos ×${multiplicadorAtual(estado)}`}
        </span>
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
      </header>

      <ul className="jogo-placar">
        {estado.jogadores.map((j, i) => (
          <li key={j.id} className={i === estado.vez ? 'jogo-jogador jogo-jogador-vez' : 'jogo-jogador'}>
            <Personagem personagem={j} expressao={expressaoNoJogo(estado, i)} />
            <span className="jogo-nome">{j.nome}</span>
            {competitivo && <strong>{j.pontos}</strong>}
          </li>
        ))}
      </ul>
      {!competitivo && (
        <p className="jogo-equipe">Estrelas da equipe: {estado.estrelas} de {totalPaineis * 3}</p>
      )}

      <Painel
        texto={painel.texto}
        letrasUsadas={estado.letrasUsadas}
        aberto={resolvido}
        digitadas={preenchendo ? digitadas : null}
      />

      <p className="jogo-dica">
        {painel.emoji && <span className="jogo-emoji" role="img" aria-label="Dica">{painel.emoji}</span>}
        {painel.dica && <span>Dica: {painel.dica}</span>}
      </p>

      {resolvido && (
        <>
          <p className="jogo-acerto" role="status">
            {competitivo
              ? `${jogadorDaVez.nome} resolveu! +${estado.ganho} pontos`
              : 'Vocês resolveram! '}
            {!competitivo && <Estrelas quantidade={estado.ganho} />}
          </p>
          <button
            className="botao jogo-proximo"
            data-foco-inicial
            onClick={() => despachar({ tipo: ACOES.PROXIMO_PAINEL })}
          >
            {ultimo ? 'Ver resultado' : 'Próximo painel'}
          </button>
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
            {jogada && !girando && (
              <p className={jogadaRuim ? 'jogo-jogada jogo-jogada-ruim' : 'jogo-jogada jogo-jogada-boa'}>{jogada}</p>
            )}
            <p className="jogo-instrucao">{textoDaInstrucao(estado, jogadorDaVez.nome, girando)}</p>
          </div>

          <div className="jogo-acoes">
            <div className="jogo-comandos">
              {competitivo && <Roleta angulo={angulo} duracao={DURACAO_GIRO} />}
              <div className="jogo-botoes">
                {competitivo && (
                  <button
                    className="botao jogo-girar"
                    disabled={!podeGirar(estado) || girando}
                    data-foco-inicial={podeGirar(estado) ? '' : undefined}
                    onClick={girar}
                  >
                    Girar
                  </button>
                )}
                <button
                  className="botao botao-secundario jogo-resolver-botao"
                  disabled={girando}
                  onClick={() => setAberto('resolver')}
                >
                  Resolver
                </button>
              </div>
            </div>
            <Teclado
              letras={painel.letras}
              usadas={estado.letrasUsadas}
              texto={painel.texto}
              habilitado={podeLetra}
              focoInicial={podeLetra}
              aoEscolher={(letra) => despachar({ tipo: ACOES.ESCOLHER_LETRA, letra })}
            />
          </div>
        </>
      )}

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

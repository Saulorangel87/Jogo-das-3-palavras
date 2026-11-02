import { useState } from 'react';
import Avatar from '../componentes/Avatar.jsx';
import Estrelas from '../componentes/Estrelas.jsx';
import {
  ACOES,
  FASES,
  MODOS,
  palavraAtual,
  podeRevelar,
  valorAtual,
} from '../logica/jogo.js';
import { useFoco, useVoltar } from '../navegacao/useNavegacao.js';
import './Jogo.css';

function Mensagem({ estado, nomeDaVez }) {
  if (estado.ultimoErro) {
    return <>Não é {estado.ultimoErro}. Agora é a vez de {nomeDaVez}.</>;
  }
  if (estado.revelouNestaVez) return <>{nomeDaVez}, agora escolha a palavra.</>;
  return <>Vez de {nomeDaVez}</>;
}

export default function Jogo({ estado, despachar, aoSair }) {
  const [saindo, setSaindo] = useState(false);
  const competitivo = estado.modo === MODOS.COMPETITIVO;
  const palavra = palavraAtual(estado);
  const resolvida = estado.fase === FASES.RESOLVIDA;
  const jogadorDaVez = estado.jogadores[estado.vez];
  const totalPalavras = estado.palavras.length;
  const ultima = estado.indicePalavra === totalPalavras - 1;

  useFoco(
    `${estado.indicePalavra}-${estado.fase}-${estado.vez}-${estado.revelados}-${saindo}`,
  );
  useVoltar(() => setSaindo(!saindo));

  const primeiraOpcao = palavra.opcoes.find((o) => !estado.descartadas.includes(o));

  return (
    <main className="tela jogo">
      <header className="jogo-topo">
        <span>{estado.tema} · Palavra {estado.indicePalavra + 1} de {totalPalavras}</span>
        <button className="botao botao-secundario jogo-sair" onClick={() => setSaindo(true)}>Sair</button>
      </header>

      <ul className="jogo-placar">
        {estado.jogadores.map((j, i) => (
          <li key={j.id} className={i === estado.vez ? 'jogo-jogador jogo-jogador-vez' : 'jogo-jogador'}>
            <Avatar personagem={j} />
            <span className="jogo-nome">{j.nome}</span>
            {competitivo && <strong>{j.pontos}</strong>}
          </li>
        ))}
      </ul>
      {!competitivo && <p className="jogo-equipe">Estrelas da equipe: {estado.estrelas} de {totalPalavras * 3}</p>}

      <div className="jogo-emoji" role="img" aria-label="Dica">{palavra.emoji}</div>

      <div className="jogo-silabas">
        {palavra.silabas.map((silaba, i) => {
          const visivel = resolvida || i < estado.revelados;
          return (
            <span key={i} className={visivel ? 'jogo-silaba jogo-silaba-aberta' : 'jogo-silaba'}>
              {visivel ? silaba : '?'}
            </span>
          );
        })}
      </div>

      {resolvida ? (
        <>
          <p className="jogo-acerto" role="status">
            {competitivo ? `${jogadorDaVez.nome} acertou! +${estado.ganho} pontos` : 'Vocês acertaram! '}
            {!competitivo && <Estrelas quantidade={estado.ganho} />}
          </p>
          <button className="botao jogo-proxima" onClick={() => despachar({ tipo: ACOES.PROXIMA_PALAVRA })}>
            {ultima ? 'Ver resultado' : 'Próxima palavra'}
          </button>
        </>
      ) : (
        <>
          <p className={estado.ultimoErro ? 'jogo-mensagem jogo-mensagem-erro' : 'jogo-mensagem'} role="status">
            <Mensagem estado={estado} nomeDaVez={jogadorDaVez.nome} />
          </p>
          <p className="jogo-valor">
            Vale agora: {competitivo ? `${valorAtual(estado)} pontos` : <Estrelas quantidade={valorAtual(estado)} />}
          </p>
          <div className="grade grade-3 jogo-opcoes">
            {palavra.opcoes.map((opcao) => {
              const descartada = estado.descartadas.includes(opcao);
              return (
                <button
                  key={opcao}
                  className={descartada ? 'botao jogo-opcao jogo-opcao-riscada' : 'botao jogo-opcao'}
                  disabled={descartada}
                  data-foco-inicial={opcao === primeiraOpcao ? '' : undefined}
                  onClick={() => despachar({ tipo: ACOES.ARRISCAR, opcao })}
                >
                  {opcao}
                </button>
              );
            })}
          </div>
          {podeRevelar(estado) && (
            <button className="botao botao-secundario jogo-revelar" onClick={() => despachar({ tipo: ACOES.REVELAR })}>
              Revelar uma sílaba
            </button>
          )}
        </>
      )}

      {saindo && (
        <div className="jogo-modal" data-modal role="dialog" aria-modal="true" aria-labelledby="titulo-sair">
          <div className="jogo-modal-caixa">
            <h2 id="titulo-sair">Sair da partida?</h2>
            <div className="grade grade-2 jogo-modal-botoes">
              <button className="botao" data-foco-inicial onClick={() => setSaindo(false)}>Continuar</button>
              <button className="botao botao-secundario" onClick={aoSair}>Sair</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

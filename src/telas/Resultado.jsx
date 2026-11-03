import { useEffect } from 'react';
import Estrelas from '../componentes/Estrelas.jsx';
import { MODOS, calcularResultado } from '../logica/jogo.js';
import { useFoco, useVoltar } from '../navegacao/useNavegacao.js';
import { tocarEfeito } from '../audio/motor.js';
import { textoDeQuemSaiu } from '../online/mensagens.js';
import Personagem from '../personagens/Personagem.jsx';
import Fundo from '../fundos/Fundo.jsx';
import './Resultado.css';

function tituloCompetitivo(vencedores) {
  if (vencedores.length > 1) return 'Empate! Parabéns a todos!';
  return `${vencedores[0].nome} venceu!`;
}

export default function Resultado({ estado, aoJogarDeNovo, aoInicio }) {
  const resultado = calcularResultado(estado);
  const competitivo = estado.modo === MODOS.COMPETITIVO;
  const motivo = textoDeQuemSaiu(estado.jogadores, estado.encerradaPorSaida);

  useEffect(() => {
    tocarEfeito('fim');
  }, []);

  useFoco('resultado');
  useVoltar(aoInicio);

  return (
    <main className="tela">
      <Fundo tipo="resultado" />
      {competitivo ? (
        <>
          <h1 className="titulo">{tituloCompetitivo(resultado.vencedores)}</h1>
          {motivo && <p className="resultado-motivo" role="status">{motivo}</p>}
          <ol className="resultado-lista">
            {resultado.ranking.map((j) => (
              <li key={j.id} className="resultado-item">
                <Personagem personagem={j} expressao={resultado.vencedores.includes(j) ? 'comemorando' : 'normal'} />
                <span className="resultado-nome">{j.nome}{j.saiu && ' (saiu)'}</span>
                <strong>{j.pontos} pontos</strong>
              </li>
            ))}
          </ol>
        </>
      ) : (
        <>
          <h1 className="titulo">Vocês conseguiram!</h1>
          <div className="resultado-equipe">
            {estado.jogadores.map((j) => (
              <Personagem key={j.id} personagem={j} expressao="comemorando" />
            ))}
          </div>
          <p className="resultado-estrelas">
            <Estrelas quantidade={resultado.estrelas} maximo={resultado.maximo} />
          </p>
          <p className="resultado-total">{resultado.estrelas} de {resultado.maximo} estrelas</p>
        </>
      )}
      <div className="grade grade-2 resultado-botoes">
        {aoJogarDeNovo && <button className="botao" data-foco-inicial onClick={aoJogarDeNovo}>Jogar de novo</button>}
        <button className={aoJogarDeNovo ? 'botao botao-secundario' : 'botao'} onClick={aoInicio}>Início</button>
      </div>
    </main>
  );
}

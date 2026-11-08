import { FATIAS_ROLETA, limitesDasFatias } from '../logica/jogo.js';
import './Roleta.css';

const CORES = ['#ffd23f', '#8ecae6', '#ff8fab', '#95d5b2', '#f4a261', '#cdb4db', '#a8dadc', '#ffb703'];
const COR_JACKPOT = '#ffb703';
const CENTRO = 100;
const RAIO = 96;
const LIMITES = limitesDasFatias();
// Média da largura das fatias: o som do giro conta um tique a cada divisão que passa pelo ponteiro.
export const GRAUS = 360 / FATIAS_ROLETA.length;

function ponto(graus, raio) {
  // 0 grau é o topo; o ângulo cresce no sentido horário.
  const radianos = ((graus - 90) * Math.PI) / 180;
  return {
    x: CENTRO + raio * Math.cos(radianos),
    y: CENTRO + raio * Math.sin(radianos),
  };
}

function inicioDaFatia(indice) {
  return LIMITES[indice].inicio * 360;
}

function fimDaFatia(indice) {
  return LIMITES[indice].fim * 360;
}

function caminhoDaFatia(indice) {
  const inicio = ponto(inicioDaFatia(indice), RAIO);
  const fim = ponto(fimDaFatia(indice), RAIO);
  return `M${CENTRO} ${CENTRO} L${inicio.x} ${inicio.y} A${RAIO} ${RAIO} 0 0 1 ${fim.x} ${fim.y} Z`;
}

// Giro horário que para a fatia sorteada no ponteiro, sempre andando para a frente.
export function proximoAngulo(anguloAtual, indice) {
  const meio = (inicioDaFatia(indice) + fimDaFatia(indice)) / 2;
  const voltasCompletas = Math.ceil(anguloAtual / 360) + 3;
  return voltasCompletas * 360 + (360 - meio);
}

export default function Roleta({ angulo, duracao }) {
  return (
    <svg className="roleta" viewBox="0 0 200 200" aria-hidden="true">
      <g
        style={{
          transform: `rotate(${angulo}deg)`,
          transformOrigin: '100px 100px',
          transition: `transform ${duracao}ms cubic-bezier(0.15, 0.8, 0.25, 1)`,
        }}
      >
        {FATIAS_ROLETA.map((fatia, i) => {
          const meio = (inicioDaFatia(i) + fimDaFatia(i)) / 2;
          const texto = ponto(meio, RAIO * 0.68);
          const estreita = (fatia.peso ?? 1) < 1;
          return (
            <g key={i}>
              <path
                d={caminhoDaFatia(i)}
                fill={fatia.jackpot ? COR_JACKPOT : CORES[i % CORES.length]}
                stroke="#14213d"
                strokeWidth="2"
              />
              <text
                x={texto.x}
                y={texto.y}
                fill="#14213d"
                fontSize={estreita ? 15 : 22}
                fontWeight="800"
                textAnchor="middle"
                dominantBaseline="central"
                transform={`rotate(${meio} ${texto.x} ${texto.y})`}
              >
                {fatia.valor}
              </text>
            </g>
          );
        })}
        <circle cx={CENTRO} cy={CENTRO} r="14" fill="#14213d" />
      </g>
      <path d="M86 0 L114 0 L100 26 Z" fill="#fdf6e3" stroke="#14213d" strokeWidth="2" />
    </svg>
  );
}

import { FATIAS_ROLETA, TIPOS_DE_FATIA, limitesDasFatias } from '../logica/jogo.js';
import './Roleta.css';

const CORES = ['#ffd23f', '#8ecae6', '#ff8fab', '#95d5b2', '#f4a261', '#cdb4db', '#a8dadc', '#ffb703'];
const COR_JACKPOT = '#ffb703';
// Fatias com efeito: fundo escuro e letras claras, para se distinguirem das de pontos.
const COR_ESPECIAL = '#14213d';
const COR_TEXTO_ESPECIAL = '#fdf6e3';
const ROTULOS = {
  [TIPOS_DE_FATIA.BONUS]: '×2',
  [TIPOS_DE_FATIA.GIRO_EXTRA]: '+GIRO',
  [TIPOS_DE_FATIA.LETRA_GRATIS]: 'LETRA',
  [TIPOS_DE_FATIA.ESCUDO]: 'ESCUDO',
  [TIPOS_DE_FATIA.SONECA]: 'SONECA',
};
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

function rotuloDaFatia(fatia) {
  return fatia.tipo === TIPOS_DE_FATIA.PONTOS ? String(fatia.valor) : ROTULOS[fatia.tipo];
}

// Número grande para pontos e ×2; palavras ficam menores para caber na fatia.
function tamanhoDoTexto(fatia, rotulo) {
  if (rotulo.length > 3) return (fatia.peso ?? 1) < 1 ? 11 : 13;
  return (fatia.peso ?? 1) < 1 ? 14 : 22;
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
          const rotulo = rotuloDaFatia(fatia);
          const especial = fatia.tipo !== TIPOS_DE_FATIA.PONTOS;
          const fundo = fatia.jackpot ? COR_JACKPOT : especial ? COR_ESPECIAL : CORES[i % CORES.length];
          // Palavras e a fatia estreita não cabem atravessando a fatia: o texto segue o raio, e do lado
          // esquerdo gira meia volta para ficar de pé. Números curtos continuam atravessados.
          const noRaio = rotulo.length > 2 || (fatia.peso ?? 1) < 1;
          const giroDoTexto = !noRaio ? meio : meio < 180 ? meio - 90 : meio + 90;
          const raioDoTexto = fatia.jackpot ? 0.72 : rotulo.length > 3 ? 0.6 : 0.68;
          const texto = ponto(meio, RAIO * raioDoTexto);
          return (
            <g key={i}>
              <path d={caminhoDaFatia(i)} fill={fundo} stroke="#14213d" strokeWidth="2" />
              <text
                x={texto.x}
                y={texto.y}
                fill={especial ? COR_TEXTO_ESPECIAL : '#14213d'}
                fontSize={tamanhoDoTexto(fatia, rotulo)}
                fontWeight="800"
                textAnchor="middle"
                dominantBaseline="central"
                transform={`rotate(${giroDoTexto} ${texto.x} ${texto.y})`}
              >
                {rotulo}
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

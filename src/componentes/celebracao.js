import { JOGADAS } from '../logica/jogo.js';
import { letrasDoTexto } from '../logica/texto.js';

// Tempos da comemoração de um painel resolvido. A animação (Painel e Festa) e o som
// (useEfeitosDoJogo) usam estes mesmos números, para um acompanhar o outro.
const PASSO_MAXIMO_MS = 70;
const DURACAO_DA_ONDA_MS = 800;
const PAUSA_ATE_O_ESTOURO_MS = 300;
export const ATRASO_DEPOIS_DA_LETRA_MS = 450;

export function contarCasas(texto) {
  return letrasDoTexto(texto).length;
}

// Intervalo entre uma casa e a próxima na onda de pulinhos.
export function passoDaOnda(casas) {
  return Math.min(PASSO_MAXIMO_MS, Math.floor(DURACAO_DA_ONDA_MS / Math.max(casas, 1)));
}

// Quando o estouro de confete acontece, contado a partir do começo da onda.
export function atrasoDoEstouro(casas) {
  return (Math.max(casas, 1) - 1) * passoDaOnda(casas) + PAUSA_ATE_O_ESTOURO_MS;
}

// Se foi uma letra que resolveu o painel, a comemoração espera o som da letra terminar.
export function atrasoDaCelebracao(estado) {
  const jogada = estado.ultimaJogada;
  return jogada && jogada.tipo === JOGADAS.LETRA_CERTA ? ATRASO_DEPOIS_DA_LETRA_MS : 0;
}

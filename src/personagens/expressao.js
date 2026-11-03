import { FASES, JOGADAS, MODOS } from '../logica/jogo.js';

// Traduz o estado do jogo na cara de cada jogador. Só lê o estado: nenhuma regra aqui.
export function expressaoNoJogo(estado, indice) {
  if (estado.fase === FASES.RESOLVIDO) {
    const equipe = estado.modo === MODOS.COOPERATIVO;
    return equipe || indice === estado.vez ? 'comemorando' : 'normal';
  }
  const jogada = estado.ultimaJogada;
  if (jogada && jogada.quem === indice) {
    return jogada.tipo === JOGADAS.LETRA_CERTA ? 'comemorando' : 'quase';
  }
  return indice === estado.vez ? 'pensando' : 'normal';
}

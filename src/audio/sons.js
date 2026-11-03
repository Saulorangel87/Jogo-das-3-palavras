// Efeitos do jogo. Cada um recebe (ctx, destino, quando, opcoes) e devolve a duração em segundos.
import { bip, frequencia } from './sintese.js';
import { tocarNota } from './instrumentos.js';

const ESPACO_MINIMO_ENTRE_TIQUES = 0.03;

// Instantes (em segundos) dos tiques da roleta: aceleram no começo e desaceleram até parar,
// acompanhando a curva da animação. Cada tique é uma divisão de fatia passando pelo ponteiro.
export function temposDosTiques(quantidade, duracaoMs) {
  const total = duracaoMs / 1000;
  const tempos = [];
  for (let i = 1; i <= quantidade; i++) {
    const t = total * (1 - Math.pow(1 - i / quantidade, 1 / 3));
    if (tempos.length === 0 || t - tempos[tempos.length - 1] >= ESPACO_MINIMO_ENTRE_TIQUES) {
      tempos.push(t);
    }
  }
  return tempos;
}

function arpejo(ctx, destino, instrumento, notas, quando, passo, vol) {
  notas.forEach((nota, i) => {
    const ultima = i === notas.length - 1;
    tocarNota(ctx, destino, instrumento, nota, quando + i * passo, ultima ? 0.5 : passo, vol);
  });
  return (notas.length - 1) * passo + 0.7;
}

export const EFEITOS = {
  giro(ctx, destino, quando, { tiques = 24, duracao = 2600 } = {}) {
    const tempos = temposDosTiques(tiques, duracao);
    tempos.forEach((t, i) => {
      bip(ctx, destino, { tipo: 'square', freq: i % 2 ? 1250 : 1100, quando: quando + t, dur: 0.03, vol: 0.1 });
    });
    return duracao / 1000;
  },

  letraCerta(ctx, destino, quando, { quantidade = 1 } = {}) {
    const notas = [1047, 1319, 1568].slice(0, Math.min(Math.max(quantidade, 1), 3));
    notas.forEach((freq, i) => {
      bip(ctx, destino, { tipo: 'sine', freq, quando: quando + i * 0.1, dur: 0.25, vol: 0.3 });
      bip(ctx, destino, { tipo: 'triangle', freq: freq * 2, quando: quando + i * 0.1, dur: 0.15, vol: 0.06 });
    });
    return notas.length * 0.1 + 0.25;
  },

  letraErrada(ctx, destino, quando) {
    bip(ctx, destino, { tipo: 'sine', freq: 330, ate: 170, quando, dur: 0.3, vol: 0.45 });
    bip(ctx, destino, { tipo: 'triangle', freq: 165, ate: 85, quando, dur: 0.3, vol: 0.3 });
    return 0.3;
  },

  chuteErrado(ctx, destino, quando) {
    bip(ctx, destino, { tipo: 'triangle', freq: 392, quando, dur: 0.2, vol: 0.28 });
    bip(ctx, destino, { tipo: 'triangle', freq: 294, quando: quando + 0.2, dur: 0.35, vol: 0.28 });
    return 0.55;
  },

  resolvido(ctx, destino, quando) {
    return arpejo(ctx, destino, 'piano', [72, 76, 79, 84], quando, 0.11, 0.3);
  },

  fim(ctx, destino, quando) {
    const duracao = arpejo(ctx, destino, 'xilofone', [72, 76, 79, 84, 88, 91, 96], quando, 0.1, 0.3);
    const acorde = quando + 0.75;
    [72, 76, 79, 84].forEach((nota) => {
      bip(ctx, destino, { tipo: 'triangle', freq: frequencia(nota), quando: acorde, dur: 0.9, vol: 0.14 });
    });
    return Math.max(duracao, 0.75 + 0.9);
  },
};

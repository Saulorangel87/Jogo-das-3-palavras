// Efeitos do jogo. Cada um recebe (ctx, destino, quando, opcoes) e devolve a duração em segundos.
import { bip, frequencia, rajada } from './sintese.js';
import { tocarNota } from './instrumentos.js';

const ESPACO_MINIMO_ENTRE_TIQUES = 0.03;
// Mesma pausa de celebracao.js entre o fim da onda e o estouro de confete (em segundos).
const PAUSA_ATE_O_ESTOURO = 0.3;
// Escala de dó maior em pentatônica, subindo duas oitavas e meia (notas MIDI).
const ESCALA_DA_ONDA = [72, 74, 76, 79, 81, 84, 86, 88, 91, 93, 96];
// Brilhos do confete: [atraso em segundos, frequência em Hz].
const BRILHOS = [[0.02, 3520], [0.08, 4186], [0.15, 3136], [0.21, 4699], [0.29, 3951], [0.37, 5274], [0.46, 3729], [0.55, 4435]];

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

  // Aviso curto nos últimos segundos da vez.
  tique(ctx, destino, quando) {
    bip(ctx, destino, { tipo: 'square', freq: 880, quando, dur: 0.05, vol: 0.08 });
    return 0.05;
  },

  // Prêmio da roleta sem pontos (bônus, escudo, giro extra): três notas subindo.
  premio(ctx, destino, quando) {
    [1047, 1319, 1760].forEach((freq, i) => {
      bip(ctx, destino, { tipo: 'sine', freq, quando: quando + i * 0.08, dur: 0.22, vol: 0.28 });
      bip(ctx, destino, { tipo: 'triangle', freq: freq * 2, quando: quando + i * 0.08, dur: 0.12, vol: 0.05 });
    });
    return 0.5;
  },

  // Soneca: duas notas suaves descendo, como um bocejo.
  soneca(ctx, destino, quando) {
    bip(ctx, destino, { tipo: 'sine', freq: 440, ate: 330, quando, dur: 0.35, vol: 0.25 });
    bip(ctx, destino, { tipo: 'sine', freq: 330, ate: 247, quando: quando + 0.3, dur: 0.5, vol: 0.22 });
    return 0.8;
  },

  // Fatia de 100 pontos: arpejo brilhante subindo e um acorde cheio no fim.
  jackpot(ctx, destino, quando) {
    const duracao = arpejo(ctx, destino, 'xilofone', [76, 79, 84, 88, 91, 96], quando, 0.07, 0.3);
    const acorde = quando + 0.45;
    [76, 84, 88, 91].forEach((nota) => {
      bip(ctx, destino, { tipo: 'triangle', freq: frequencia(nota), quando: acorde, dur: 0.8, vol: 0.12 });
    });
    return Math.max(duracao, 0.45 + 0.8);
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

  // Painel resolvido: um tilintar sobe a escala acompanhando a onda de pulinhos das casas
  // e termina num estouro de confete. `passo` e `casas` vêm dos mesmos tempos da animação.
  // Com `comJingle`, o jingle do personagem faz o final e o acorde fica de fora.
  celebracao(ctx, destino, quando, { casas = 5, passo = 0.07, comJingle = false } = {}) {
    const total = Math.max(casas, 1);
    for (let i = 0; i < total; i++) {
      const nota = ESCALA_DA_ONDA[Math.floor((i * ESCALA_DA_ONDA.length) / total)];
      const t = quando + i * passo + 0.1;
      bip(ctx, destino, { tipo: 'sine', freq: frequencia(nota), quando: t, dur: 0.2, vol: 0.16 });
      bip(ctx, destino, { tipo: 'triangle', freq: frequencia(nota + 12), quando: t, dur: 0.12, vol: 0.04 });
    }

    const estouro = quando + (total - 1) * passo + PAUSA_ATE_O_ESTOURO;
    // Estalo do confete saindo, seguido de uma chuva de brilhos agudos.
    bip(ctx, destino, { tipo: 'sine', freq: 520, ate: 160, quando: estouro, dur: 0.12, vol: 0.2 });
    rajada(ctx, destino, { quando: estouro, dur: 0.3, vol: 0.09, filtro: { tipo: 'highpass', freq: 5000 } });
    BRILHOS.forEach(([atraso, freq]) => {
      bip(ctx, destino, { tipo: 'sine', freq, quando: estouro + atraso, dur: 0.1, vol: 0.07 });
    });

    if (comJingle) return estouro - quando + 0.5;
    [72, 76, 79, 84].forEach((nota) => {
      bip(ctx, destino, { tipo: 'triangle', freq: frequencia(nota), quando: estouro, dur: 0.9, vol: 0.09 });
      bip(ctx, destino, { tipo: 'sine', freq: frequencia(nota + 12), quando: estouro, dur: 0.7, vol: 0.04 });
    });
    return estouro - quando + 0.9;
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

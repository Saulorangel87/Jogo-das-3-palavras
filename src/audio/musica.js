// Trilhas em loop, todas originais e escritas como dados: cada faixa tem 8 compassos de 4/4,
// em colcheias (8 passos por compasso). Nada aqui toca som: `agendarCompasso` só entrega as
// notas a uma função `tocar`, e é o motor que liga isso à Web Audio.
//
// Graus: 0 é a tônica da faixa; 7 é a mesma nota uma oitava acima; números negativos descem.
// A escala (maior ou menor natural) transforma o grau em semitons.

const MAIOR = [0, 2, 4, 5, 7, 9, 11];
const MENOR = [0, 2, 3, 5, 7, 8, 10];

export const PASSOS_POR_COMPASSO = 8;
export const COMPASSOS_POR_FAIXA = 8;

// Alturas MIDI das peças da bateria (as mesmas de instrumentos.js).
const PECA = { k: 36, s: 38, h: 42, p: 49 };

// Baixo: [passo, grau a partir da raiz do acorde]. Arpejo: idem, uma oitava acima da raiz.
const BAIXO_MARCHA = [[0, 0], [4, 4]];
const BAIXO_SALTITANTE = [[0, 0], [3, 0], [4, 4], [7, 4]];
const BAIXO_LONGO = [[0, 0]];
const ARPEJO_SUBINDO = [[0, 0], [1, 2], [2, 4], [3, 7], [4, 4], [5, 2], [6, 4], [7, 2]];
const ARPEJO_LEVE = [[0, 0], [2, 2], [4, 4], [6, 2]];
const ARPEJO_ESPARSO = [[0, 0], [4, 4]];

export const FAIXAS = {
  // Telas de início e configuração: leve e acolhedora.
  abertura: {
    escala: MAIOR, tom: 60, bpm: 100,
    progressao: [0, 4, 5, 3, 0, 4, 3, 4],
    baixo: BAIXO_MARCHA, arpejo: ARPEJO_LEVE, bateria: 'h.h.h.h.',
    melodia: [
      [[0, 7, 2], [2, 9, 1], [3, 8, 1], [4, 7, 2], [6, 4, 2]],
      [[0, 8, 2], [2, 6, 1], [3, 8, 1], [4, 9, 2], [6, 8, 2]],
      [[0, 9, 2], [2, 7, 1], [3, 9, 1], [4, 10, 2], [6, 9, 2]],
      [[0, 10, 2], [2, 9, 1], [3, 7, 1], [4, 9, 2], [6, 10, 2]],
      [[0, 7, 2], [2, 9, 1], [3, 11, 1], [4, 11, 2], [6, 9, 2]],
      [[0, 8, 2], [2, 10, 1], [3, 9, 1], [4, 8, 2], [6, 6, 2]],
      [[0, 10, 2], [2, 9, 2], [4, 7, 2], [6, 9, 1], [7, 10, 1]],
      [[0, 8, 3], [3, 6, 1], [4, 8, 2], [6, 6, 2]],
    ],
  },
  // As cinco faixas de jogo. O tema da partida escolhe uma delas.
  alegre: {
    escala: MAIOR, tom: 67, bpm: 116,
    progressao: [0, 3, 0, 4, 0, 3, 4, 0],
    baixo: BAIXO_SALTITANTE, arpejo: ARPEJO_SUBINDO, bateria: 'k.h.s.h.',
    melodia: [
      [[0, 7, 1], [1, 9, 1], [2, 11, 2], [4, 9, 2], [6, 7, 2]],
      [[0, 10, 1], [1, 9, 1], [2, 7, 2], [4, 9, 2], [6, 10, 2]],
      [[0, 11, 1], [1, 9, 1], [2, 7, 2], [4, 9, 2], [6, 11, 2]],
      [[0, 8, 2], [2, 10, 2], [4, 9, 3]],
      [[0, 7, 1], [1, 9, 1], [2, 11, 2], [4, 12, 2], [6, 11, 2]],
      [[0, 10, 1], [1, 12, 1], [2, 10, 2], [4, 9, 2], [6, 7, 2]],
      [[0, 8, 2], [2, 9, 2], [4, 10, 2], [6, 8, 2]],
      [[0, 7, 4], [4, 4, 2], [6, 7, 2]],
    ],
  },
  calma: {
    escala: MAIOR, tom: 65, bpm: 78,
    progressao: [0, 5, 3, 4, 0, 5, 1, 4],
    baixo: BAIXO_LONGO, arpejo: ARPEJO_LEVE, bateria: null,
    melodia: [
      [[0, 9, 4], [4, 7, 4]],
      [[0, 7, 3], [4, 9, 2], [6, 10, 2]],
      [[0, 10, 4], [4, 9, 4]],
      [[0, 8, 3], [3, 6, 1], [4, 8, 4]],
      [[0, 9, 4], [4, 11, 4]],
      [[0, 10, 2], [2, 9, 2], [4, 7, 4]],
      [[0, 8, 4], [4, 10, 2], [6, 9, 2]],
      [[0, 8, 3], [4, 7, 4]],
    ],
  },
  aventura: {
    escala: MENOR, tom: 57, bpm: 118,
    progressao: [0, 5, 2, 6, 0, 3, 4, 0],
    baixo: BAIXO_MARCHA, arpejo: ARPEJO_SUBINDO, bateria: 'k..hs.h.',
    melodia: [
      [[0, 7, 2], [2, 9, 1], [3, 7, 1], [4, 6, 2], [6, 7, 2]],
      [[0, 9, 2], [2, 10, 1], [3, 9, 1], [4, 7, 2], [6, 5, 2]],
      [[0, 11, 2], [2, 9, 1], [3, 11, 1], [4, 12, 2], [6, 11, 2]],
      [[0, 10, 2], [2, 8, 1], [3, 10, 1], [4, 9, 2], [6, 8, 2]],
      [[0, 7, 2], [2, 9, 1], [3, 7, 1], [4, 6, 2], [6, 7, 2]],
      [[0, 10, 2], [2, 12, 1], [3, 10, 1], [4, 8, 2], [6, 10, 2]],
      [[0, 11, 2], [2, 10, 1], [3, 8, 1], [4, 11, 2], [6, 8, 2]],
      [[0, 7, 4], [4, 9, 2], [6, 7, 2]],
    ],
  },
  misterio: {
    escala: MENOR, tom: 62, bpm: 88,
    progressao: [0, 0, 5, 4, 0, 3, 5, 4],
    baixo: BAIXO_LONGO, arpejo: ARPEJO_ESPARSO, bateria: null,
    melodia: [
      [[0, 7, 2], [3, 9, 1], [4, 8, 4]],
      [[1, 9, 2], [4, 7, 3]],
      [[0, 12, 3], [4, 11, 1], [5, 9, 3]],
      [[0, 8, 2], [3, 6, 1], [4, 8, 4]],
      [[0, 7, 2], [3, 9, 1], [4, 10, 4]],
      [[1, 10, 2], [4, 9, 3]],
      [[0, 12, 2], [3, 11, 1], [4, 9, 4]],
      [[0, 8, 3], [4, 6, 4]],
    ],
  },
  festa: {
    escala: MAIOR, tom: 62, bpm: 124,
    progressao: [0, 3, 4, 0, 0, 3, 4, 4],
    baixo: BAIXO_SALTITANTE, arpejo: ARPEJO_SUBINDO, bateria: 'k.hhs.hh',
    melodia: [
      [[0, 9, 1], [1, 11, 1], [2, 12, 2], [4, 11, 1], [5, 9, 1], [6, 7, 2]],
      [[0, 10, 1], [1, 12, 1], [2, 14, 2], [4, 12, 1], [5, 10, 1], [6, 8, 2]],
      [[0, 11, 1], [1, 9, 1], [2, 8, 2], [4, 9, 2], [6, 8, 2]],
      [[0, 9, 2], [2, 11, 2], [4, 12, 4]],
      [[0, 9, 1], [1, 11, 1], [2, 12, 2], [4, 14, 2], [6, 12, 2]],
      [[0, 10, 1], [1, 12, 1], [2, 14, 2], [4, 15, 2], [6, 14, 2]],
      [[0, 11, 2], [2, 9, 2], [4, 8, 2], [6, 6, 2]],
      [[0, 8, 2], [2, 9, 2], [4, 7, 4]],
    ],
  },
};

export const FAIXAS_DE_JOGO = ['alegre', 'calma', 'aventura', 'misterio', 'festa'];

// Temas com clima óbvio têm faixa própria; os outros são distribuídos pelo nome,
// sempre na mesma faixa para o mesmo tema.
const CLIMAS = [
  [/festa|natal|carnaval|circo|m[uú]sica|aniversário/i, 'festa'],
  [/fantasia|folclore|espa[cç]o|c[ée]u|noite|mist[ée]rio/i, 'misterio'],
  [/mar|praia|natureza|clima|jardim|plantas|[áa]rvores|casa|fam[íi]lia|corpo|sentimentos|cores/i, 'calma'],
  [/animais|bichos|aventura|viagem|transportes|esportes|brincadeiras/i, 'aventura'],
];

function somaDoNome(nome) {
  let soma = 0;
  for (let i = 0; i < nome.length; i++) soma = (soma * 31 + nome.charCodeAt(i)) % 100003;
  return soma;
}

export function faixaDoTema(tema) {
  const nome = String(tema || '');
  const clima = CLIMAS.find(([regra]) => regra.test(nome));
  if (clima) return clima[1];
  return FAIXAS_DE_JOGO[somaDoNome(nome) % FAIXAS_DE_JOGO.length];
}

export function duracaoDoCompasso(faixa) {
  return (PASSOS_POR_COMPASSO * 60) / (faixa.bpm * 2);
}

function midiDoGrau(faixa, grau) {
  const n = faixa.escala.length;
  const oitava = Math.floor(grau / n);
  return faixa.tom + faixa.escala[((grau % n) + n) % n] + 12 * oitava;
}

// Entrega todas as notas de um compasso a `tocar(instrumento, midi, quando, duracao, volume)`.
// `indice` pode crescer sem limite: a faixa dá a volta sozinha.
export function agendarCompasso(faixa, indice, quando, tocar) {
  const compasso = ((indice % COMPASSOS_POR_FAIXA) + COMPASSOS_POR_FAIXA) % COMPASSOS_POR_FAIXA;
  const passo = 60 / faixa.bpm / 2;
  const raiz = faixa.progressao[compasso];

  faixa.baixo.forEach(([p, g]) => {
    tocar('tuba', midiDoGrau(faixa, raiz + g - 14), quando + p * passo, passo * 3, 0.07);
  });
  faixa.arpejo.forEach(([p, g]) => {
    tocar('piano', midiDoGrau(faixa, raiz + g + 7), quando + p * passo, passo * 2, 0.045);
  });
  faixa.melodia[compasso].forEach(([p, grau, duracao]) => {
    tocar('xilofone', midiDoGrau(faixa, grau), quando + p * passo, duracao * passo, 0.075);
  });
  if (faixa.bateria) {
    faixa.bateria.split('').forEach((letra, p) => {
      if (PECA[letra]) tocar('bateria', PECA[letra], quando + p * passo, passo, 0.05);
    });
  }
}

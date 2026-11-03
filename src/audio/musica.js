// Música de fundo, toda original e escrita como dados. Ela acompanha o andamento do jogo:
//
//   - o ANDAMENTO (bpm) sobe conforme as letras do painel vão abrindo;
//   - as CAMADAS entram em ordem: base (colchão e baixo) sempre, arpejo cheio, melodia e
//     depois a bateria, à medida que o painel se completa;
//   - a cada painel novo o andamento recomeça um pouco mais alto que no anterior.
//
// Nada aqui toca som. `criarAgendador` só entrega as notas a uma função `tocar`; o motor
// liga isso à Web Audio. Por isso tudo pode ser testado sem áudio.
//
// As melodias usam escala pentatônica, que não "desafina" com nenhum acorde da progressão.
// Grau 0 é a tônica da faixa; os graus seguem a escala e a oitava vem a cada 5 graus.

const PENTA_MAIOR = [0, 2, 4, 7, 9];
const PENTA_MENOR = [0, 3, 5, 7, 10];

export const PASSOS_POR_COMPASSO = 8;
export const COMPASSOS_POR_FAIXA = 8;

const ACORDE = { M: [0, 4, 7], m: [0, 3, 7] };

// Alturas MIDI das peças da bateria (as mesmas de instrumentos.js).
const PECA = { k: 36, s: 38, h: 42 };

// Baixo: [passo, intervalo em semitons acima da raiz do acorde].
const BAIXO_SALTITANTE = [[0, 0], [3, 0], [4, 7], [7, 0]];
const BAIXO_SAMBA = [[0, 0], [3, 7], [4, 0], [7, 7]];
const BAIXO_MARCHA = [[0, 0], [4, 7]];
const BAIXO_LONGO = [[0, 0], [6, 7]];

// Arpejo: [passo, nota do acorde (0 raiz, 1 terça, 2 quinta, 3 raiz oitava acima)].
const ARPEJO_CHEIO = [[0, 0], [1, 1], [2, 2], [3, 3], [4, 2], [5, 1], [6, 2], [7, 1]];
const ARPEJO_ESPARSO = [[0, 0], [4, 2]];

export const FAIXAS = {
  // Início e configuração: andamento fixo e calmo, sem bateria.
  abertura: {
    escala: PENTA_MAIOR, tom: 67, bpmMin: 96, bpmMax: 96, fixo: 0.55,
    acordes: [[0, 'M'], [9, 'm'], [5, 'M'], [7, 'M'], [0, 'M'], [9, 'm'], [5, 'M'], [7, 'M']],
    baixo: BAIXO_MARCHA, bateria: 'k...k...',
    melodia: [
      [[0, 5, 2], [2, 4, 1], [3, 3, 1], [4, 2, 2], [6, 3, 2]],
      [[0, 4, 2], [2, 3, 1], [3, 4, 1], [4, 5, 2], [6, 4, 2]],
      [[0, 5, 1], [1, 6, 1], [2, 5, 2], [4, 3, 2], [6, 4, 2]],
      [[0, 3, 2], [2, 4, 1], [3, 3, 1], [4, 2, 4]],
      [[0, 6, 2], [2, 5, 1], [3, 4, 1], [4, 5, 2], [6, 3, 2]],
      [[0, 4, 1], [1, 5, 1], [2, 6, 2], [4, 5, 2], [6, 4, 2]],
      [[0, 5, 2], [2, 4, 1], [3, 3, 1], [4, 4, 2], [6, 5, 2]],
      [[0, 6, 2], [2, 5, 2], [4, 3, 4]],
    ],
  },
  // As quatro faixas de jogo. O tema da partida escolhe uma delas.
  saltitante: {
    escala: PENTA_MAIOR, tom: 60, bpmMin: 100, bpmMax: 132,
    acordes: [[0, 'M'], [9, 'm'], [5, 'M'], [7, 'M'], [0, 'M'], [9, 'm'], [5, 'M'], [7, 'M']],
    baixo: BAIXO_SALTITANTE, bateria: 'k.h.s.h.',
    melodia: [
      [[0, 5, 1], [2, 6, 1], [3, 7, 2], [6, 5, 1], [7, 3, 1]],
      [[0, 4, 1], [2, 5, 1], [3, 6, 2], [6, 5, 1], [7, 4, 1]],
      [[0, 5, 1], [2, 4, 1], [3, 3, 2], [6, 4, 1], [7, 5, 1]],
      [[0, 6, 2], [3, 7, 1], [4, 6, 1], [6, 3, 2]],
      [[0, 7, 1], [2, 8, 1], [3, 7, 2], [6, 5, 1], [7, 7, 1]],
      [[0, 7, 1], [2, 6, 1], [3, 5, 2], [6, 4, 2]],
      [[0, 5, 1], [2, 6, 1], [3, 7, 1], [4, 8, 2], [6, 7, 2]],
      [[0, 6, 3], [4, 5, 1], [5, 6, 1], [6, 3, 2]],
    ],
  },
  aventura: {
    escala: PENTA_MENOR, tom: 57, bpmMin: 104, bpmMax: 136,
    acordes: [[0, 'm'], [8, 'M'], [3, 'M'], [10, 'M'], [0, 'm'], [8, 'M'], [10, 'M'], [0, 'm']],
    baixo: BAIXO_MARCHA, bateria: 'k..hs.h.',
    melodia: [
      [[0, 5, 1], [1, 6, 1], [2, 8, 2], [4, 7, 1], [5, 6, 1], [6, 5, 2]],
      [[0, 6, 1], [1, 7, 1], [2, 8, 2], [4, 6, 2], [6, 5, 2]],
      [[0, 8, 2], [2, 9, 1], [3, 8, 1], [4, 7, 2], [6, 6, 2]],
      [[0, 7, 2], [2, 6, 1], [3, 5, 1], [4, 4, 4]],
      [[0, 5, 1], [1, 6, 1], [2, 8, 2], [4, 9, 2], [6, 8, 2]],
      [[0, 8, 2], [2, 7, 1], [3, 6, 1], [4, 7, 2], [6, 6, 2]],
      [[0, 9, 2], [2, 8, 1], [3, 7, 1], [4, 6, 2], [6, 4, 2]],
      [[0, 5, 4], [4, 6, 1], [5, 5, 1], [6, 4, 2]],
    ],
  },
  festa: {
    escala: PENTA_MAIOR, tom: 62, bpmMin: 108, bpmMax: 140,
    acordes: [[0, 'M'], [5, 'M'], [7, 'M'], [0, 'M'], [0, 'M'], [5, 'M'], [7, 'M'], [7, 'M']],
    baixo: BAIXO_SAMBA, bateria: 'k.hhs.hh',
    melodia: [
      [[1, 5, 1], [2, 7, 1], [3, 8, 2], [5, 7, 1], [6, 5, 2]],
      [[1, 5, 1], [2, 7, 1], [3, 9, 2], [5, 8, 1], [6, 7, 2]],
      [[0, 8, 2], [2, 7, 1], [3, 6, 1], [4, 5, 2], [6, 6, 2]],
      [[0, 5, 3], [3, 7, 1], [4, 8, 2], [6, 7, 2]],
      [[1, 5, 1], [2, 7, 1], [3, 8, 2], [5, 9, 1], [6, 8, 2]],
      [[1, 9, 1], [2, 8, 1], [3, 7, 2], [5, 6, 1], [6, 5, 2]],
      [[0, 6, 1], [1, 7, 1], [2, 8, 2], [4, 7, 1], [5, 6, 1], [6, 5, 2]],
      [[0, 6, 3], [4, 8, 2], [6, 7, 2]],
    ],
  },
  suave: {
    escala: PENTA_MAIOR, tom: 65, bpmMin: 84, bpmMax: 112,
    acordes: [[0, 'M'], [9, 'm'], [5, 'M'], [7, 'M'], [0, 'M'], [9, 'm'], [5, 'M'], [7, 'M']],
    baixo: BAIXO_LONGO, bateria: 'k.h...h.',
    melodia: [
      [[0, 5, 3], [3, 6, 1], [4, 7, 4]],
      [[0, 7, 2], [2, 6, 2], [4, 5, 4]],
      [[0, 5, 2], [2, 4, 2], [4, 5, 2], [6, 6, 2]],
      [[0, 6, 3], [3, 5, 1], [4, 3, 4]],
      [[0, 5, 2], [2, 7, 2], [4, 6, 2], [6, 5, 2]],
      [[0, 7, 3], [3, 6, 1], [4, 5, 4]],
      [[0, 4, 2], [2, 5, 2], [4, 6, 4]],
      [[0, 6, 2], [2, 5, 2], [4, 3, 4]],
    ],
  },
};

export const FAIXAS_DE_JOGO = ['saltitante', 'aventura', 'festa', 'suave'];

// Temas com clima óbvio têm faixa própria; os outros são distribuídos pelo nome,
// sempre na mesma faixa para o mesmo tema.
const CLIMAS = [
  [/festa|natal|carnaval|circo|m[uú]sica|anivers[áa]rio/i, 'festa'],
  [/fantasia|folclore|espa[cç]o|animais selvagens|bichos|aventura|viagem|transportes|esportes|brincadeiras/i, 'aventura'],
  [/mar|praia|natureza|clima|jardim|plantas|[áa]rvores|casa|fam[íi]lia|corpo|sentimentos|cores/i, 'suave'],
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

// --- Andamento e camadas ---------------------------------------------------------------

const AUMENTO_POR_PAINEL = 0.03; // cada painel começa 3% mais rápido que o anterior
const SUBIDA_MAXIMA_POR_PASSO = 0.8; // bpm: o andamento sobe devagar, sem trancos
const DESCIDA_MAXIMA_POR_PASSO = 2; // e desce mais rápido, ao começar um painel novo

export const LIMIAR_DO_ARPEJO_CHEIO = 0.25;
export const LIMIAR_DA_MELODIA = 0.3;
export const LIMIAR_DA_BATERIA = 0.6;

function limitar(valor, minimo, maximo) {
  return Math.min(maximo, Math.max(minimo, valor));
}

// `entrada`: { progresso: 0 a 1 (quanto do painel já abriu), painel: número do painel (0, 1, 2) }.
export function andamentoAlvo(faixa, entrada) {
  const progresso = faixa.fixo !== undefined ? faixa.fixo : limitar(entrada.progresso, 0, 1);
  const base = faixa.bpmMin + (faixa.bpmMax - faixa.bpmMin) * progresso;
  const painel = faixa.fixo !== undefined ? 0 : Math.max(0, entrada.painel || 0);
  return base * (1 + AUMENTO_POR_PAINEL * painel);
}

export function camadasDoProgresso(faixa, progresso) {
  const p = faixa.fixo !== undefined ? faixa.fixo : progresso;
  return {
    arpejoCheio: p >= LIMIAR_DO_ARPEJO_CHEIO,
    melodia: p >= LIMIAR_DA_MELODIA,
    bateria: p >= LIMIAR_DA_BATERIA,
  };
}

export function duracaoDoPasso(bpm) {
  return 60 / bpm / 2;
}

function midiDoGrau(faixa, grau) {
  const n = faixa.escala.length;
  const oitava = Math.floor(grau / n);
  return faixa.tom + faixa.escala[((grau % n) + n) % n] + 12 * oitava;
}

function notaDoAcorde(faixa, compasso, indice) {
  const [raiz, qualidade] = faixa.acordes[compasso];
  const tons = ACORDE[qualidade];
  const oitavas = Math.floor(indice / tons.length);
  return faixa.tom + raiz + tons[indice % tons.length] + 12 * oitavas;
}

// Agendador passo a passo (colcheia por colcheia). Quem chama avisa até que instante quer as
// notas e diz como está o jogo naquele momento; o andamento muda de um passo para o outro.
export function criarAgendador(faixa) {
  const estado = { passo: 0, bpm: faixa.bpmMin, proximo: 0 };

  function darPasso(entrada, tocar) {
    const indice = estado.passo % (PASSOS_POR_COMPASSO * COMPASSOS_POR_FAIXA);
    const compasso = Math.floor(indice / PASSOS_POR_COMPASSO);
    const passoDoCompasso = indice % PASSOS_POR_COMPASSO;
    const duracao = duracaoDoPasso(estado.bpm);
    const progresso = faixa.fixo !== undefined ? faixa.fixo : limitar(entrada.progresso, 0, 1);
    const camadas = camadasDoProgresso(faixa, progresso);
    const quando = estado.proximo;

    // Colchão: um acorde macio por compasso, sempre presente.
    if (passoDoCompasso === 0) {
      [0, 1, 2].forEach((i) => {
        tocar('colchao', notaDoAcorde(faixa, compasso, i), quando, PASSOS_POR_COMPASSO * duracao, 0.03);
      });
    }
    faixa.baixo.forEach(([p, intervalo]) => {
      if (p !== passoDoCompasso) return;
      const raiz = faixa.tom + faixa.acordes[compasso][0] - 12;
      tocar('baixoRedondo', raiz + intervalo, quando, duracao * 3, 0.14);
    });
    const arpejo = camadas.arpejoCheio ? ARPEJO_CHEIO : ARPEJO_ESPARSO;
    arpejo.forEach(([p, nota]) => {
      if (p === passoDoCompasso) tocar('harpa', notaDoAcorde(faixa, compasso, nota), quando, duracao * 2, 0.05);
    });
    if (camadas.melodia) {
      faixa.melodia[compasso].forEach(([p, grau, passos]) => {
        if (p === passoDoCompasso) tocar('kalimba', midiDoGrau(faixa, grau), quando, passos * duracao, 0.1);
      });
    }
    if (camadas.bateria && faixa.bateria) {
      const peca = PECA[faixa.bateria[passoDoCompasso]];
      if (peca) tocar('bateria', peca, quando, duracao, 0.05);
    }

    // O andamento anda em direção ao alvo, subindo devagar e descendo mais rápido.
    const alvo = andamentoAlvo(faixa, entrada);
    const diferenca = alvo - estado.bpm;
    estado.bpm += limitar(diferenca, -DESCIDA_MAXIMA_POR_PASSO, SUBIDA_MAXIMA_POR_PASSO);
    estado.proximo += duracao;
    estado.passo += 1;
  }

  return {
    estado,
    // `entrada` pode ser uma função, lida a cada passo, para o jogo poder mudar no meio.
    iniciar(quando) {
      estado.proximo = quando;
    },
    avancar(ate, entrada, tocar) {
      while (estado.proximo < ate) darPasso(typeof entrada === 'function' ? entrada() : entrada, tocar);
    },
  };
}

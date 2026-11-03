import { describe, expect, it } from 'vitest';
import iniciante from '../data/iniciante.json';
import intermediario from '../data/intermediario.json';
import avancado from '../data/avancado.json';
import {
  COMPASSOS_POR_FAIXA,
  FAIXAS,
  FAIXAS_DE_JOGO,
  PASSOS_POR_COMPASSO,
  andamentoAlvo,
  camadasDoProgresso,
  criarAgendador,
  duracaoDoPasso,
  faixaDoTema,
} from './musica.js';

// Roda o agendador por `passos` passos, com o jogo na situação dada, e devolve as notas.
function rodar(faixa, entrada, passos, agendador = criarAgendador(faixa)) {
  const notas = [];
  agendador.iniciar(0);
  for (let i = 0; i < passos; i++) {
    agendador.avancar(agendador.estado.proximo + 1e-6, entrada, (instrumento, midi, quando, dur, vol) => {
      notas.push({ instrumento, midi, quando, dur, vol });
    });
  }
  return { notas, agendador };
}

const instrumentosDe = (notas) => new Set(notas.map((n) => n.instrumento));

describe('faixas de música', () => {
  it.each(Object.keys(FAIXAS))('%s: tem 8 compassos e padrões dentro do compasso', (nome) => {
    const faixa = FAIXAS[nome];
    expect(faixa.acordes).toHaveLength(COMPASSOS_POR_FAIXA);
    expect(faixa.melodia).toHaveLength(COMPASSOS_POR_FAIXA);
    for (const compasso of faixa.melodia) {
      for (const [passo, , duracao] of compasso) {
        expect(passo).toBeGreaterThanOrEqual(0);
        expect(passo).toBeLessThan(PASSOS_POR_COMPASSO);
        expect(passo + duracao).toBeLessThanOrEqual(PASSOS_POR_COMPASSO);
      }
    }
    for (const [passo] of faixa.baixo) expect(passo).toBeLessThan(PASSOS_POR_COMPASSO);
    if (faixa.bateria) expect(faixa.bateria).toHaveLength(PASSOS_POR_COMPASSO);
    expect(faixa.bpmMax).toBeGreaterThanOrEqual(faixa.bpmMin);
  });

  it.each(Object.keys(FAIXAS))('%s: notas em alturas e volumes razoáveis nas 8 voltas', (nome) => {
    const faixa = FAIXAS[nome];
    const { notas } = rodar(faixa, { progresso: 1, painel: 0 }, PASSOS_POR_COMPASSO * COMPASSOS_POR_FAIXA * 2);
    expect(notas.length).toBeGreaterThan(200);
    for (const n of notas) {
      if (n.instrumento !== 'bateria') {
        expect(n.midi).toBeGreaterThanOrEqual(36);
        expect(n.midi).toBeLessThanOrEqual(96);
      }
      expect(n.vol).toBeLessThanOrEqual(0.15);
      expect(n.dur).toBeGreaterThan(0);
    }
  });
});

describe('a música acompanha o andamento do jogo', () => {
  const faixa = FAIXAS.saltitante;

  it('o alvo de andamento sobe com o progresso do painel', () => {
    expect(andamentoAlvo(faixa, { progresso: 0, painel: 0 })).toBe(faixa.bpmMin);
    expect(andamentoAlvo(faixa, { progresso: 1, painel: 0 })).toBe(faixa.bpmMax);
    expect(andamentoAlvo(faixa, { progresso: 0.5, painel: 0 })).toBeGreaterThan(faixa.bpmMin);
    expect(andamentoAlvo(faixa, { progresso: 0.5, painel: 0 })).toBeLessThan(faixa.bpmMax);
  });

  it('cada painel começa mais rápido que o anterior', () => {
    const [a, b, c] = [0, 1, 2].map((painel) => andamentoAlvo(faixa, { progresso: 0, painel }));
    expect(b).toBeGreaterThan(a);
    expect(c).toBeGreaterThan(b);
  });

  it('as camadas entram em ordem: base, arpejo cheio, melodia, bateria', () => {
    const vazio = instrumentosDe(rodar(faixa, { progresso: 0, painel: 0 }, 32).notas);
    expect(vazio).toEqual(new Set(['colchao', 'baixoRedondo', 'harpa']));
    const meio = camadasDoProgresso(faixa, 0.4);
    expect(meio).toEqual({ arpejoCheio: true, melodia: true, bateria: false });
    const cheio = instrumentosDe(rodar(faixa, { progresso: 0.9, painel: 0 }, 64).notas);
    expect(cheio).toContain('kalimba');
    expect(cheio).toContain('bateria');
  });

  it('com o painel vazio não há melodia nem bateria', () => {
    const notas = rodar(faixa, { progresso: 0.1, painel: 0 }, 64).notas;
    expect(instrumentosDe(notas).has('kalimba')).toBe(false);
    expect(instrumentosDe(notas).has('bateria')).toBe(false);
  });

  it('o andamento acelera aos poucos enquanto o painel abre, sem passar do máximo', () => {
    const { agendador } = rodar(faixa, { progresso: 0, painel: 0 }, 8);
    const inicio = agendador.estado.bpm;
    expect(inicio).toBeCloseTo(faixa.bpmMin, 5);
    let anterior = inicio;
    for (let i = 0; i < 200; i++) {
      agendador.avancar(agendador.estado.proximo + 1e-6, { progresso: 1, painel: 0 }, () => {});
      expect(agendador.estado.bpm).toBeGreaterThanOrEqual(anterior);
      expect(agendador.estado.bpm - anterior).toBeLessThanOrEqual(1);
      anterior = agendador.estado.bpm;
    }
    expect(anterior).toBeCloseTo(faixa.bpmMax, 5);
  });

  it('ao começar um painel novo o andamento volta a descer', () => {
    const { agendador } = rodar(faixa, { progresso: 1, painel: 0 }, 200);
    const alto = agendador.estado.bpm;
    for (let i = 0; i < 100; i++) {
      agendador.avancar(agendador.estado.proximo + 1e-6, { progresso: 0, painel: 1 }, () => {});
    }
    expect(agendador.estado.bpm).toBeLessThan(alto);
    expect(agendador.estado.bpm).toBeCloseTo(andamentoAlvo(faixa, { progresso: 0, painel: 1 }), 5);
  });

  it('as notas ficam cada vez mais próximas quando o andamento sobe', () => {
    const { agendador } = rodar(faixa, { progresso: 1, painel: 0 }, 1);
    const tempos = [];
    for (let i = 0; i < 120; i++) {
      tempos.push(agendador.estado.proximo);
      agendador.avancar(agendador.estado.proximo + 1e-6, { progresso: 1, painel: 0 }, () => {});
    }
    const primeiro = tempos[1] - tempos[0];
    const ultimo = tempos[119] - tempos[118];
    expect(ultimo).toBeLessThan(primeiro);
    expect(ultimo).toBeCloseTo(duracaoDoPasso(faixa.bpmMax), 3);
  });

  it('só agenda o que cai antes do limite pedido e não repete ao chamar de novo', () => {
    const agendador = criarAgendador(faixa);
    agendador.iniciar(10);
    const notas = [];
    const tocar = (i, m, quando) => notas.push(quando);
    agendador.avancar(11, { progresso: 0.5, painel: 0 }, tocar);
    const quantidade = notas.length;
    expect(Math.min(...notas)).toBeGreaterThanOrEqual(10);
    expect(Math.max(...notas)).toBeLessThan(11 + duracaoDoPasso(faixa.bpmMax));
    agendador.avancar(11, { progresso: 0.5, painel: 0 }, tocar);
    expect(notas.length).toBe(quantidade);
  });

  it('a entrada pode ser uma função, lida a cada passo', () => {
    let progresso = 0;
    const agendador = criarAgendador(faixa);
    agendador.iniciar(0);
    const vistos = new Set();
    for (let i = 0; i < 40; i++) {
      if (i === 20) progresso = 1;
      agendador.avancar(agendador.estado.proximo + 1e-6, () => ({ progresso, painel: 0 }), (instrumento) => vistos.add(instrumento));
    }
    expect(vistos.has('kalimba')).toBe(true);
  });

  it('a abertura toca em andamento fixo, com melodia e sem bateria forte', () => {
    const { agendador, notas } = rodar(FAIXAS.abertura, { progresso: 1, painel: 2 }, 100);
    expect(agendador.estado.bpm).toBe(FAIXAS.abertura.bpmMin);
    expect(instrumentosDe(notas).has('kalimba')).toBe(true);
    expect(instrumentosDe(notas).has('bateria')).toBe(false);
  });

  it('a faixa dá a volta: depois do compasso 8 a melodia recomeça igual', () => {
    const passos = PASSOS_POR_COMPASSO;
    const { notas } = rodar(faixa, { progresso: 1, painel: 0 }, passos * (COMPASSOS_POR_FAIXA + 1));
    const melodia = notas.filter((n) => n.instrumento === 'kalimba').map((n) => n.midi);
    const naFaixa = faixa.melodia.reduce((soma, compasso) => soma + compasso.length, 0);
    const primeiroCompasso = faixa.melodia[0].length;
    expect(melodia.slice(naFaixa, naFaixa + primeiroCompasso)).toEqual(melodia.slice(0, primeiroCompasso));
  });
});

describe('faixaDoTema', () => {
  it('sempre devolve uma faixa de jogo e é estável', () => {
    expect(FAIXAS_DE_JOGO).toContain(faixaDoTema('Qualquer tema'));
    expect(faixaDoTema('Fazenda')).toBe(faixaDoTema('Fazenda'));
    expect(FAIXAS_DE_JOGO).toContain(faixaDoTema(undefined));
  });

  it('temas de clima óbvio ganham a faixa do clima', () => {
    expect(faixaDoTema('Festa junina')).toBe('festa');
    expect(faixaDoTema('Fantasia')).toBe('aventura');
    expect(faixaDoTema('Praia e piscina')).toBe('suave');
  });

  it('os temas reais do banco usam todas as faixas de jogo, nenhuma com menos de 5%', () => {
    const temas = [...iniciante, ...intermediario, ...avancado].map((t) => t.tema);
    const contagem = {};
    for (const tema of temas) contagem[faixaDoTema(tema)] = (contagem[faixaDoTema(tema)] || 0) + 1;
    for (const nome of FAIXAS_DE_JOGO) {
      expect(contagem[nome] || 0).toBeGreaterThanOrEqual(temas.length * 0.05);
    }
  });
});

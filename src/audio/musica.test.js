import { describe, expect, it } from 'vitest';
import iniciante from '../data/iniciante.json';
import intermediario from '../data/intermediario.json';
import avancado from '../data/avancado.json';
import {
  COMPASSOS_POR_FAIXA,
  FAIXAS,
  FAIXAS_DE_JOGO,
  PASSOS_POR_COMPASSO,
  agendarCompasso,
  duracaoDoCompasso,
  faixaDoTema,
} from './musica.js';

function notasDoCompasso(faixa, indice) {
  const notas = [];
  agendarCompasso(faixa, indice, 10, (instrumento, midi, quando, dur, vol) => {
    notas.push({ instrumento, midi, quando, dur, vol });
  });
  return notas;
}

describe('faixas de música', () => {
  it.each(Object.keys(FAIXAS))('%s: tem 8 compassos e padrões dentro do compasso', (nome) => {
    const faixa = FAIXAS[nome];
    expect(faixa.progressao).toHaveLength(COMPASSOS_POR_FAIXA);
    expect(faixa.melodia).toHaveLength(COMPASSOS_POR_FAIXA);
    for (const compasso of faixa.melodia) {
      for (const [passo, , duracao] of compasso) {
        expect(passo).toBeGreaterThanOrEqual(0);
        expect(passo).toBeLessThan(PASSOS_POR_COMPASSO);
        expect(passo + duracao).toBeLessThanOrEqual(PASSOS_POR_COMPASSO);
      }
    }
    for (const [passo] of [...faixa.baixo, ...faixa.arpejo]) {
      expect(passo).toBeLessThan(PASSOS_POR_COMPASSO);
    }
    if (faixa.bateria) expect(faixa.bateria).toHaveLength(PASSOS_POR_COMPASSO);
  });

  it.each(Object.keys(FAIXAS))('%s: notas em alturas e volumes razoáveis, dentro do compasso', (nome) => {
    const faixa = FAIXAS[nome];
    const compasso = duracaoDoCompasso(faixa);
    for (let i = 0; i < COMPASSOS_POR_FAIXA; i++) {
      const notas = notasDoCompasso(faixa, i);
      expect(notas.length).toBeGreaterThan(0);
      for (const n of notas) {
        if (n.instrumento !== 'bateria') {
          expect(n.midi).toBeGreaterThanOrEqual(24);
          expect(n.midi).toBeLessThanOrEqual(100);
        }
        expect(n.vol).toBeLessThanOrEqual(0.1);
        expect(n.quando).toBeGreaterThanOrEqual(10);
        expect(n.quando).toBeLessThan(10 + compasso);
      }
    }
  });

  it('a faixa dá a volta: o compasso 8 é igual ao 0', () => {
    const faixa = FAIXAS.alegre;
    expect(notasDoCompasso(faixa, COMPASSOS_POR_FAIXA)).toEqual(notasDoCompasso(faixa, 0));
    expect(notasDoCompasso(faixa, -1)).toEqual(notasDoCompasso(faixa, COMPASSOS_POR_FAIXA - 1));
  });

  it('cada faixa dura entre 10 e 30 segundos', () => {
    for (const faixa of Object.values(FAIXAS)) {
      const total = duracaoDoCompasso(faixa) * COMPASSOS_POR_FAIXA;
      expect(total).toBeGreaterThan(10);
      expect(total).toBeLessThan(30);
    }
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
    expect(faixaDoTema('Fantasia')).toBe('misterio');
    expect(faixaDoTema('Praia e piscina')).toBe('calma');
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

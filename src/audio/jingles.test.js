import { describe, expect, it } from 'vitest';
import { PERSONAGENS } from '../data/personagens.js';
import { INSTRUMENTOS } from './instrumentos.js';
import { JINGLES, duracaoDoJingle } from './jingles.js';

const PECAS_DA_BATERIA = [36, 38, 42, 49];

describe('jingles', () => {
  it('cada personagem tem o seu', () => {
    expect(Object.keys(JINGLES).sort()).toEqual(PERSONAGENS.map((p) => p.id).sort());
  });

  it.each(Object.entries(JINGLES))('%s: instrumento, notas e duração válidos', (id, jingle) => {
    expect(INSTRUMENTOS).toContain(jingle.instrumento);
    expect(jingle.notas.length).toBeGreaterThanOrEqual(4);
    for (const [nota, tempos] of jingle.notas) {
      expect(tempos).toBeGreaterThan(0);
      if (nota === null) continue;
      if (jingle.instrumento === 'bateria') expect(PECAS_DA_BATERIA).toContain(nota);
      else expect(Number.isInteger(nota) && nota >= 36 && nota <= 96).toBe(true);
    }
    const duracao = duracaoDoJingle(jingle);
    expect(duracao).toBeGreaterThan(0.6);
    expect(duracao).toBeLessThan(3.5);
  });

  it('cada jingle é diferente dos outros', () => {
    const assinaturas = Object.values(JINGLES).map((j) => JSON.stringify(j.notas));
    expect(new Set(assinaturas).size).toBe(assinaturas.length);
  });
});

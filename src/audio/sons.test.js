import { describe, expect, it } from 'vitest';
import { temposDosTiques } from './sons.js';

describe('temposDosTiques', () => {
  const tempos = temposDosTiques(32, 2600);

  it('crescem sem passar da duração da animação', () => {
    for (let i = 1; i < tempos.length; i++) expect(tempos[i]).toBeGreaterThan(tempos[i - 1]);
    expect(tempos[0]).toBeGreaterThan(0);
    expect(tempos[tempos.length - 1]).toBeCloseTo(2.6, 5);
  });

  it('desaceleram: o intervalo médio cresce a cada terço da animação', () => {
    const intervalos = tempos.slice(1).map((t, i) => t - tempos[i]);
    const terco = Math.floor(intervalos.length / 3);
    const media = (lista) => lista.reduce((soma, v) => soma + v, 0) / lista.length;
    const primeiro = media(intervalos.slice(0, terco));
    const segundo = media(intervalos.slice(terco, 2 * terco));
    const terceiro = media(intervalos.slice(2 * terco));
    expect(segundo).toBeGreaterThan(primeiro);
    expect(terceiro).toBeGreaterThan(segundo);
  });

  it('não deixa tiques colados', () => {
    for (let i = 1; i < tempos.length; i++) expect(tempos[i] - tempos[i - 1]).toBeGreaterThanOrEqual(0.03 - 1e-9);
  });

  it('sem tiques, não há nada para tocar', () => {
    expect(temposDosTiques(0, 2600)).toEqual([]);
  });
});

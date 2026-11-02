import { describe, expect, it } from 'vitest';
import { escolherDestino } from './espacial.js';

const caixa = (left, top) => ({ left, top, width: 100, height: 50 });

// Grade 2 x 2.
const a = caixa(0, 0);
const b = caixa(200, 0);
const c = caixa(0, 100);
const d = caixa(200, 100);

describe('escolherDestino', () => {
  it('move para o vizinho em cada direção', () => {
    expect(escolherDestino(a, [b, c, d], 'direita')).toBe(0);
    expect(escolherDestino(a, [b, c, d], 'baixo')).toBe(1);
    expect(escolherDestino(d, [a, b, c], 'cima')).toBe(1);
    expect(escolherDestino(d, [a, b, c], 'esquerda')).toBe(2);
  });

  it('não encontra destino fora da grade', () => {
    expect(escolherDestino(a, [b, c, d], 'cima')).toBe(-1);
    expect(escolherDestino(a, [b, c, d], 'esquerda')).toBe(-1);
  });
});

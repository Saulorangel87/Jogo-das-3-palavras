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

  it('prefere quem está na mesma linha a um botão logo abaixo, quase na mesma coluna', () => {
    // Painel de som: o + fica quase em cima do Fechar, e o − está na linha do +.
    const menos = { left: 300, top: 100, width: 60, height: 60 };
    const mais = { left: 560, top: 100, width: 60, height: 60 };
    const silenciar = { left: 300, top: 200, width: 150, height: 60 };
    const fechar = { left: 500, top: 200, width: 150, height: 60 };
    const outros = [menos, silenciar, fechar];
    expect(escolherDestino(mais, outros, 'esquerda')).toBe(0);
    expect(escolherDestino(mais, outros, 'baixo')).toBe(2);
    expect(escolherDestino(menos, [mais, silenciar, fechar], 'baixo')).toBe(1);
    expect(escolherDestino(fechar, [menos, mais, silenciar], 'cima')).toBe(1);
  });

  it('sem ninguém alinhado, cai para o mais próximo na direção', () => {
    const origem = { left: 0, top: 0, width: 100, height: 50 };
    const abaixoADireita = { left: 300, top: 200, width: 100, height: 50 };
    expect(escolherDestino(origem, [abaixoADireita], 'direita')).toBe(0);
    expect(escolherDestino(origem, [abaixoADireita], 'baixo')).toBe(0);
  });
});

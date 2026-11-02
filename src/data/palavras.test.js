import { describe, expect, it } from 'vitest';
import { carregarPalavras } from './palavras.js';

describe('carregarPalavras', () => {
  it('rejeita nível desconhecido', async () => {
    await expect(carregarPalavras('impossivel')).rejects.toThrow();
  });

  it('todo tema tem ao menos 3 palavras', async () => {
    for (const tema of await carregarPalavras('iniciante')) {
      expect(tema.palavras.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('as sílabas de cada palavra formam a palavra e há emoji', async () => {
    for (const tema of await carregarPalavras('iniciante')) {
      for (const p of tema.palavras) {
        expect(p.silabas.join('')).toBe(p.palavra);
        expect(p.emoji).toBeTruthy();
      }
    }
  });
});

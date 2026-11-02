import { describe, expect, it } from 'vitest';
import { carregarPalavras } from './palavras.js';

const NIVEIS = ['iniciante', 'intermediario', 'avancado'];

describe('carregarPalavras', () => {
  it('rejeita nível desconhecido', async () => {
    await expect(carregarPalavras('impossivel')).rejects.toThrow();
  });

  it.each(NIVEIS)('%s: temas com 3 itens ou mais, sem repetição', async (nivel) => {
    const temas = await carregarPalavras(nivel);
    const textos = temas.flatMap((t) => t.itens.map((i) => i.texto));
    expect(new Set(textos).size).toBe(textos.length);
    for (const tema of temas) expect(tema.itens.length).toBeGreaterThanOrEqual(3);
  });

  it.each(NIVEIS)('%s: textos válidos e com dica', async (nivel) => {
    for (const tema of await carregarPalavras(nivel)) {
      for (const item of tema.itens) {
        expect(item.texto).toMatch(/^[A-ZÀ-Ý]+( [A-ZÀ-Ý]+)*$/);
        for (const palavra of item.texto.split(' ')) {
          expect(palavra.length).toBeLessThanOrEqual(12);
        }
        expect(item.emoji || item.dica).toBeTruthy();
      }
    }
  });
});

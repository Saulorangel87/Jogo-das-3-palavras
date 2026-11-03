import { describe, expect, it } from 'vitest';
import { carregarPalavras } from './palavras.js';

const NIVEIS = ['iniciante', 'intermediario', 'avancado'];
const MINIMO_POR_NIVEL = 1000;

function normalizar(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

// Emoji de Unicode novo demais não aparece em TV e navegador antigos.
function emojiAntigo(texto) {
  for (const simbolo of texto) {
    const c = simbolo.codePointAt(0);
    if (c >= 0x1fa00) return false;
    if (c >= 0x1f6f7 && c <= 0x1f6ff) return false;
    if (c >= 0x1f95f && c <= 0x1f97f) return false;
    if (c >= 0x1f992 && c <= 0x1f9bf) return false;
    if (c >= 0x1f9c1 && c <= 0x1f9ff) return false;
  }
  return true;
}

describe('carregarPalavras', () => {
  it('rejeita nível desconhecido', async () => {
    await expect(carregarPalavras('impossivel')).rejects.toThrow();
  });

  it.each(NIVEIS)('%s: pelo menos mil itens, sem repetição', async (nivel) => {
    const temas = await carregarPalavras(nivel);
    const textos = temas.flatMap((t) => t.itens.map((i) => normalizar(i.texto)));
    expect(textos.length).toBeGreaterThanOrEqual(MINIMO_POR_NIVEL);
    expect(new Set(textos).size).toBe(textos.length);
  });

  it.each(NIVEIS)('%s: cada tema tem 3 itens ou mais', async (nivel) => {
    for (const tema of await carregarPalavras(nivel)) {
      expect(tema.itens.length).toBeGreaterThanOrEqual(3);
    }
  });

  it.each(NIVEIS)('%s: textos válidos, com emoji antigo ou dica', async (nivel) => {
    for (const tema of await carregarPalavras(nivel)) {
      for (const item of tema.itens) {
        expect(item.texto).toMatch(/^[A-ZÀ-Ý]+( [A-ZÀ-Ý]+)*$/);
        for (const palavra of item.texto.split(' ')) {
          expect(palavra.length).toBeLessThanOrEqual(12);
        }
        expect(Boolean(item.emoji) !== Boolean(item.dica)).toBe(true);
        if (item.emoji) expect(emojiAntigo(item.emoji)).toBe(true);
      }
    }
  });

  it.each(NIVEIS)('%s: a dica escrita não entrega a resposta', async (nivel) => {
    for (const tema of await carregarPalavras(nivel)) {
      for (const item of tema.itens) {
        if (!item.dica) continue;
        const palavrasDica = normalizar(item.dica.toUpperCase()).match(/[A-Z]+/g) || [];
        for (const palavra of normalizar(item.texto).split(' ')) {
          if (palavra.length < 5) continue;
          expect(palavrasDica.includes(palavra), `${item.texto}: "${item.dica}"`).toBe(false);
        }
      }
    }
  });

  it('iniciante: uma palavra só, de 2 a 8 letras', async () => {
    for (const tema of await carregarPalavras('iniciante')) {
      for (const item of tema.itens) {
        expect(item.texto).not.toContain(' ');
        expect(item.texto.length).toBeGreaterThanOrEqual(2);
        expect(item.texto.length).toBeLessThanOrEqual(8);
      }
    }
  });

  it('intermediário: uma palavra só, de 5 a 12 letras', async () => {
    for (const tema of await carregarPalavras('intermediario')) {
      for (const item of tema.itens) {
        expect(item.texto).not.toContain(' ');
        expect(item.texto.length).toBeGreaterThanOrEqual(5);
      }
    }
  });

  it('avançado: frase de 2 a 6 palavras, até 30 letras', async () => {
    for (const tema of await carregarPalavras('avancado')) {
      for (const item of tema.itens) {
        const palavras = item.texto.split(' ');
        expect(palavras.length).toBeGreaterThanOrEqual(2);
        expect(item.texto.replace(/ /g, '').length).toBeLessThanOrEqual(30);
      }
    }
  });
});

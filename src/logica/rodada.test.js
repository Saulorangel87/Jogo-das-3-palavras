import { describe, expect, it } from 'vitest';
import banco from '../data/palavras.json';
import { montarRodada } from './rodada.js';

// Gerador previsível para repetir os testes com vários sorteios.
function gerador(semente) {
  let x = semente;
  return () => {
    x = (x * 9301 + 49297) % 233280;
    return x / 233280;
  };
}

const temas = banco.iniciante;

describe('montarRodada', () => {
  it('sorteia 3 palavras diferentes do mesmo tema, com 3 opções válidas', () => {
    for (let semente = 1; semente <= 200; semente++) {
      const rodada = montarRodada(temas, gerador(semente));
      const tema = temas.find((t) => t.tema === rodada.tema);
      const noTrio = rodada.palavras.map((p) => p.palavra);

      expect(new Set(noTrio).size).toBe(3);
      for (const p of rodada.palavras) {
        expect(tema.palavras.some((t) => t.palavra === p.palavra)).toBe(true);
        expect(new Set(p.opcoes).size).toBe(3);
        expect(p.opcoes).toContain(p.palavra);
        const erradas = p.opcoes.filter((o) => o !== p.palavra);
        for (const errada of erradas) expect(noTrio).not.toContain(errada);
      }
    }
  });

  it('prioriza opções erradas que começam com a mesma sílaba', () => {
    const banco2 = [
      { tema: 'A', palavras: ['BOLA', 'PATO', 'VACA'].map(item) },
      { tema: 'B', palavras: ['BOLO', 'BODE', 'SUCO', 'PERA', 'COCO'].map(item) },
    ];
    // Com rng fixo em 0, o tema sorteado é sempre o A, que contém BOLA.
    const rodada = montarRodada(banco2, () => 0);
    const bola = rodada.palavras.find((p) => p.palavra === 'BOLA');
    expect(bola.opcoes.filter((o) => o !== 'BOLA').sort()).toEqual(['BODE', 'BOLO']);
  });
});

function item(palavra) {
  return { palavra, silabas: [palavra.slice(0, 2), palavra.slice(2)], emoji: 'x' };
}

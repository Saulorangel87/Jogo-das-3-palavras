import { describe, expect, it } from 'vitest';
import { JOGADAS } from '../logica/jogo.js';
import { atrasoDaCelebracao, atrasoDoEstouro, contarCasas, passoDaOnda } from './celebracao.js';

describe('tempos da celebração', () => {
  it('conta só as letras, sem os espaços', () => {
    expect(contarCasas('PÃO COM MANTEIGA')).toBe(14);
    expect(contarCasas('PATO')).toBe(4);
  });

  it('a onda de qualquer painel dura no máximo 800 ms', () => {
    for (const casas of [1, 4, 12, 20, 30]) {
      expect((casas - 1) * passoDaOnda(casas)).toBeLessThanOrEqual(800);
    }
  });

  it('palavras curtas usam o passo máximo e frases longas, passos menores', () => {
    expect(passoDaOnda(4)).toBe(70);
    expect(passoDaOnda(30)).toBeLessThan(passoDaOnda(4));
    expect(passoDaOnda(30)).toBeGreaterThan(0);
  });

  it('o estouro vem depois da última casa pular', () => {
    for (const casas of [1, 4, 14, 30]) {
      expect(atrasoDoEstouro(casas)).toBeGreaterThan((casas - 1) * passoDaOnda(casas));
    }
  });

  it('espera o som da letra só quando uma letra resolveu o painel', () => {
    expect(atrasoDaCelebracao({ ultimaJogada: { tipo: JOGADAS.LETRA_CERTA } })).toBeGreaterThan(0);
    expect(atrasoDaCelebracao({ ultimaJogada: null })).toBe(0);
  });
});

import { describe, expect, it } from 'vitest';
import { contarCasasFechadas, contarOcorrencias, normalizarLetra } from './texto.js';

describe('texto', () => {
  it('trata acentos e cedilha como a letra base', () => {
    expect(['Á', 'Ã', 'Â', 'Ç', 'É', 'Ó'].map(normalizarLetra)).toEqual(['A', 'A', 'A', 'C', 'E', 'O']);
  });

  it('conta ocorrências ignorando espaços e acentos', () => {
    expect(contarOcorrencias('PÃO COM MANTEIGA', 'A')).toBe(3);
    expect(contarOcorrencias('LIÇÃO DE CASA', 'C')).toBe(2);
    expect(contarOcorrencias('PATO', 'Z')).toBe(0);
  });

  it('conta casas fechadas', () => {
    expect(contarCasasFechadas('LÁPIS DE COR', [])).toBe(10);
    expect(contarCasasFechadas('COCO', ['C'])).toBe(2);
    expect(contarCasasFechadas('COCO', ['C', 'O'])).toBe(0);
  });
});

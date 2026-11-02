import { describe, expect, it } from 'vitest';
import {
  contarCasasFechadas,
  contarOcorrencias,
  mesmaResposta,
  montarResposta,
  normalizarLetra,
} from './texto.js';

describe('texto', () => {
  it('trata acentos e cedilha como a letra base', () => {
    expect(['Á', 'Ã', 'Â', 'Ç', 'É', 'Ó'].map(normalizarLetra)).toEqual(['A', 'A', 'A', 'C', 'E', 'O']);
  });

  it('conta ocorrências ignorando espaços e acentos', () => {
    expect(contarOcorrencias('PÃO COM MANTEIGA', 'A')).toBe(3);
    expect(contarOcorrencias('LIÇÃO DE CASA', 'C')).toBe(2);
    expect(contarOcorrencias('PATO', 'Z')).toBe(0);
  });

  it('compara respostas ignorando acentos', () => {
    expect(mesmaResposta('LIÇÃO DE CASA', 'LICAO DE CASA')).toBe(true);
    expect(mesmaResposta('LIÇÃO DE CASA', 'LICAO DE COSA')).toBe(false);
  });

  it('monta a resposta com as letras digitadas nas casas fechadas', () => {
    expect(montarResposta('PÃO COM MEL', ['A', 'M'], ['P', 'O', 'C', 'O', 'E', 'L'])).toBe('PÃO COM MEL');
    expect(montarResposta('PATO', ['A'], ['G', 'L', 'O'])).toBe('GALO');
  });

  it('conta casas fechadas', () => {
    expect(contarCasasFechadas('LÁPIS DE COR', [])).toBe(10);
    expect(contarCasasFechadas('COCO', ['C'])).toBe(2);
    expect(contarCasasFechadas('COCO', ['C', 'O'])).toBe(0);
  });
});

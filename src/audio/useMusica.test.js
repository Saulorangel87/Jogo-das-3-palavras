import { describe, expect, it } from 'vitest';
import { faixaDaTela } from './useMusica.js';
import { faixaDoTema } from './musica.js';

describe('faixaDaTela', () => {
  it('início e configuração usam a abertura', () => {
    expect(faixaDaTela('inicio')).toBe('abertura');
    expect(faixaDaTela('config')).toBe('abertura');
  });

  it('no jogo, o tema escolhe a faixa', () => {
    expect(faixaDaTela('jogo', 'Fazenda', false)).toBe(faixaDoTema('Fazenda'));
  });

  it('no resultado a música para, para o som de fim aparecer', () => {
    expect(faixaDaTela('jogo', 'Fazenda', true)).toBeNull();
  });
});

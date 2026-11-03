import { describe, expect, it } from 'vitest';
import { ACOES, aplicarAcao, criarPartida, MODOS } from '../logica/jogo.js';
import { situacaoDaMusica } from './useMusica.js';
import { faixaDoTema } from './musica.js';

function partida() {
  return criarPartida({
    modo: MODOS.COOPERATIVO,
    nivel: 'avancado',
    jogadores: [{ id: 'lala', nome: 'Lalá' }, { id: 'boris', nome: 'Bóris' }],
    rodada: {
      tema: 'Fazenda',
      paineis: [
        { texto: 'PATO', letras: ['A', 'O', 'P', 'T', 'X'], opcoes: null, dica: 'x' },
        { texto: 'VACA', letras: ['A', 'C', 'V'], opcoes: null, dica: 'x' },
        { texto: 'GATO', letras: ['A', 'G', 'O', 'T'], opcoes: null, dica: 'x' },
      ],
    },
  });
}

describe('situacaoDaMusica', () => {
  it('início e configuração usam a abertura', () => {
    expect(situacaoDaMusica('inicio', null).faixa).toBe('abertura');
    expect(situacaoDaMusica('config', null).faixa).toBe('abertura');
  });

  it('no jogo, o tema escolhe a faixa e o progresso é a parte aberta do painel', () => {
    let estado = partida();
    expect(situacaoDaMusica('jogo', estado)).toMatchObject({
      faixa: faixaDoTema('Fazenda'),
      progresso: 0,
      painel: 0,
      abafar: false,
    });
    estado = aplicarAcao(estado, { tipo: ACOES.ESCOLHER_LETRA, letra: 'A' });
    expect(situacaoDaMusica('jogo', estado).progresso).toBeCloseTo(0.25, 5);
    estado = aplicarAcao(estado, { tipo: ACOES.ESCOLHER_LETRA, letra: 'T' });
    expect(situacaoDaMusica('jogo', estado).progresso).toBeCloseTo(0.5, 5);
  });

  it('quando o painel é resolvido, o progresso é total e a música abaixa', () => {
    let estado = partida();
    for (const letra of ['P', 'A', 'T']) estado = aplicarAcao(estado, { tipo: ACOES.ESCOLHER_LETRA, letra });
    estado = aplicarAcao(estado, { tipo: ACOES.ESCOLHER_LETRA, letra: 'O' });
    const situacao = situacaoDaMusica('jogo', estado);
    expect(situacao.progresso).toBe(1);
    expect(situacao.abafar).toBe(true);
  });

  it('no painel seguinte o progresso zera e o número do painel sobe', () => {
    let estado = partida();
    for (const letra of ['P', 'A', 'T', 'O']) estado = aplicarAcao(estado, { tipo: ACOES.ESCOLHER_LETRA, letra });
    estado = aplicarAcao(estado, { tipo: ACOES.PROXIMO_PAINEL });
    const situacao = situacaoDaMusica('jogo', estado);
    expect(situacao.progresso).toBe(0);
    expect(situacao.painel).toBe(1);
    expect(situacao.abafar).toBe(false);
  });

  it('no resultado a música para', () => {
    const estado = { ...partida(), fase: 'fim' };
    expect(situacaoDaMusica('jogo', estado).faixa).toBeNull();
  });
});

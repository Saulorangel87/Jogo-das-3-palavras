import { describe, expect, it } from 'vitest';
import { ACOES, MODOS, aplicarAcao, criarPartida } from '../logica/jogo.js';
import { expressaoNoJogo } from './expressao.js';

const ALFABETO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function partida(modo = MODOS.COMPETITIVO) {
  return criarPartida({
    modo,
    nivel: 'avancado',
    jogadores: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
    rodada: {
      tema: 'T',
      paineis: [{ texto: 'COCO', letras: ALFABETO, opcoes: null }],
    },
  });
}

const girar = (e) => aplicarAcao(e, { tipo: ACOES.GIRAR, sorteio: 0 });
const letra = (e, l) => aplicarAcao(e, { tipo: ACOES.ESCOLHER_LETRA, letra: l });
const caras = (e) => [0, 1, 2].map((i) => expressaoNoJogo(e, i));

describe('expressaoNoJogo', () => {
  it('quem tem a vez fica pensando', () => {
    expect(caras(partida())).toEqual(['pensando', 'normal', 'normal']);
  });

  it('quem acerta a letra comemora', () => {
    expect(caras(letra(girar(partida()), 'C'))[0]).toBe('comemorando');
  });

  it('quem erra fica no quase e o próximo pensa', () => {
    expect(caras(letra(girar(partida()), 'Z'))).toEqual(['quase', 'pensando', 'normal']);
  });

  it('ao girar de novo volta a pensar', () => {
    expect(caras(girar(letra(girar(partida()), 'C')))[0]).toBe('pensando');
  });

  it('no competitivo só quem resolveu comemora', () => {
    const e = aplicarAcao(partida(), { tipo: ACOES.RESOLVER, resposta: 'COCO' });
    expect(caras(e)).toEqual(['comemorando', 'normal', 'normal']);
  });

  it('no cooperativo a equipe toda comemora', () => {
    const e = aplicarAcao(partida(MODOS.COOPERATIVO), { tipo: ACOES.RESOLVER, resposta: 'COCO' });
    expect(caras(e)).toEqual(['comemorando', 'comemorando', 'comemorando']);
  });
});

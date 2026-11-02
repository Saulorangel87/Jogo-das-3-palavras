import { describe, expect, it } from 'vitest';
import {
  ACOES,
  FASES,
  MODOS,
  aplicarAcao,
  calcularEstrelas,
  calcularPontos,
  calcularResultado,
  criarPartida,
  podeRevelar,
  valorAtual,
} from './jogo.js';

const palavra = (nome) => ({
  palavra: nome,
  silabas: [nome.slice(0, 2), nome.slice(2)],
  emoji: 'x',
  opcoes: [nome, 'ERRA', 'FALA'],
});

function partida(modo = MODOS.COMPETITIVO, totalJogadores = 2) {
  return criarPartida({
    modo,
    jogadores: Array.from({ length: totalJogadores }, (_, i) => ({ id: `j${i}` })),
    rodada: { tema: 'T', palavras: ['PATO', 'VACA', 'GALO'].map(palavra) },
  });
}

const revelar = (e) => aplicarAcao(e, { tipo: ACOES.REVELAR });
const arriscar = (e, opcao) => aplicarAcao(e, { tipo: ACOES.ARRISCAR, opcao });
const proxima = (e) => aplicarAcao(e, { tipo: ACOES.PROXIMA_PALAVRA });

describe('pontuação', () => {
  it('desconta 30% por penalidade, com mínimo de 30%', () => {
    expect([0, 1, 2, 3, 4].map((p) => calcularPontos(0, p))).toEqual([10, 7, 4, 3, 3]);
    expect([0, 1, 2, 3, 4].map((p) => calcularPontos(1, p))).toEqual([20, 14, 8, 6, 6]);
    expect([0, 1, 2, 3, 4].map((p) => calcularPontos(2, p))).toEqual([30, 21, 12, 9, 9]);
  });

  it('dá 3, 2 ou 1 estrelas conforme as penalidades', () => {
    expect([0, 1, 2, 3].map(calcularEstrelas)).toEqual([3, 2, 1, 1]);
  });
});

describe('revelar', () => {
  it('não encerra a vez e permite só 1 revelação por vez', () => {
    const e = revelar(partida());
    expect(e.vez).toBe(0);
    expect(e.revelados).toBe(1);
    expect(podeRevelar(e)).toBe(false);
    expect(revelar(e)).toBe(e);
  });

  it('o próximo jogador pode revelar depois de um erro', () => {
    const e = arriscar(revelar(partida()), 'ERRA');
    expect(e.vez).toBe(1);
    expect(podeRevelar(e)).toBe(true);
  });

  it('não revela além do fim da palavra', () => {
    let e = revelar(partida());
    e = arriscar(e, 'ERRA');
    e = revelar(e);
    e = arriscar(e, 'FALA');
    expect(e.revelados).toBe(2);
    expect(podeRevelar(e)).toBe(false);
    expect(revelar(e)).toBe(e);
  });
});

describe('arriscar', () => {
  it('errar descarta a opção, passa a vez e reduz o valor', () => {
    const e = arriscar(partida(), 'ERRA');
    expect(e.descartadas).toEqual(['ERRA']);
    expect(e.vez).toBe(1);
    expect(e.ultimoErro).toBe('ERRA');
    expect(valorAtual(e)).toBe(7);
  });

  it('ignora opção já descartada ou inexistente', () => {
    const e = arriscar(partida(), 'ERRA');
    expect(arriscar(e, 'ERRA')).toBe(e);
    expect(arriscar(e, 'NADA')).toBe(e);
  });

  it('a vez dá a volta entre os jogadores', () => {
    let e = partida(MODOS.COMPETITIVO, 2);
    e = arriscar(e, 'ERRA');
    e = arriscar(e, 'FALA');
    expect(e.vez).toBe(0);
  });

  it('acertar dá os pontos a quem acertou', () => {
    const e = arriscar(arriscar(partida(), 'ERRA'), 'PATO');
    expect(e.fase).toBe(FASES.RESOLVIDA);
    expect(e.ganho).toBe(7);
    expect(e.jogadores.map((j) => j.pontos)).toEqual([0, 7]);
  });

  it('revelar e acertar na mesma vez cobra 1 penalidade', () => {
    const e = arriscar(revelar(partida()), 'PATO');
    expect(e.jogadores[0].pontos).toBe(7);
  });

  it('não aceita ações depois de resolvida', () => {
    const e = arriscar(partida(), 'PATO');
    expect(arriscar(e, 'ERRA')).toBe(e);
    expect(revelar(e)).toBe(e);
  });
});

describe('cooperativo', () => {
  it('chutar até acertar não garante mais 3 estrelas', () => {
    let e = partida(MODOS.COOPERATIVO);
    e = arriscar(e, 'ERRA');
    e = arriscar(e, 'FALA');
    e = arriscar(e, 'PATO');
    expect(e.ganho).toBe(1);
    expect(e.estrelas).toBe(1);
  });

  it('soma estrelas da equipe sem dar pontos individuais', () => {
    const e = arriscar(partida(MODOS.COOPERATIVO), 'PATO');
    expect(e.estrelas).toBe(3);
    expect(e.jogadores.every((j) => j.pontos === 0)).toBe(true);
  });
});

describe('próxima palavra e fim', () => {
  it('só avança depois de resolvida', () => {
    const e = partida();
    expect(proxima(e)).toBe(e);
  });

  it('a próxima palavra começa com o jogador seguinte a quem acertou e zera a rodada', () => {
    let e = partida(MODOS.COMPETITIVO, 3);
    e = arriscar(revelar(e), 'ERRA');
    e = arriscar(e, 'PATO');
    e = proxima(e);
    expect(e.indicePalavra).toBe(1);
    expect(e.vez).toBe(2);
    expect(e.revelados).toBe(0);
    expect(e.descartadas).toEqual([]);
    expect(e.fase).toBe(FASES.JOGANDO);
  });

  it('termina após a terceira palavra, com o vencedor correto', () => {
    let e = partida();
    e = proxima(arriscar(e, 'PATO'));
    e = proxima(arriscar(e, 'VACA'));
    e = proxima(arriscar(e, 'GALO'));
    expect(e.fase).toBe(FASES.FIM);
    const r = calcularResultado(e);
    expect(r.vencedores.map((j) => j.id)).toEqual(['j0']);
    expect(e.jogadores.map((j) => j.pontos)).toEqual([40, 20]);
  });

  it('aceita empate', () => {
    const e = { ...partida(), jogadores: [{ id: 'a', pontos: 30 }, { id: 'b', pontos: 30 }] };
    expect(calcularResultado(e).vencedores).toHaveLength(2);
  });

  it('o cooperativo chega ao máximo de 9 estrelas', () => {
    let e = partida(MODOS.COOPERATIVO);
    e = proxima(arriscar(e, 'PATO'));
    e = proxima(arriscar(e, 'VACA'));
    e = proxima(arriscar(e, 'GALO'));
    expect(calcularResultado(e)).toEqual({ estrelas: 9, maximo: 9 });
  });
});

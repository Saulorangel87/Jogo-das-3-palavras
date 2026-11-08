import { describe, expect, it } from 'vitest';
import {
  ACOES,
  FASES,
  FATIAS_ROLETA,
  JOGADAS,
  MODOS,
  aplicarAcao,
  calcularEstrelas,
  calcularResultado,
  criarPartida,
  indiceDaFatia,
  limitesDasFatias,
  podeGirar,
  temRelogio,
} from './jogo.js';

const ALFABETO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const painel = (texto) => ({
  texto,
  letras: ALFABETO,
  opcoes: [texto, 'ERRADA', 'OUTRA'],
});

function partida(modo = MODOS.COMPETITIVO, totalJogadores = 2) {
  return criarPartida({
    modo,
    nivel: 'iniciante',
    jogadores: Array.from({ length: totalJogadores }, (_, i) => ({ id: `j${i}` })),
    rodada: { tema: 'T', paineis: ['COCO', 'PATO', 'GALO'].map(painel) },
  });
}

// Sorteio que cai na fatia de valor 10 (a primeira).
const girar = (e, sorteio = 0) => aplicarAcao(e, { tipo: ACOES.GIRAR, sorteio });
const letra = (e, l) => aplicarAcao(e, { tipo: ACOES.ESCOLHER_LETRA, letra: l });
const resolver = (e, resposta) => aplicarAcao(e, { tipo: ACOES.RESOLVER, resposta });
const proximo = (e) => aplicarAcao(e, { tipo: ACOES.PROXIMO_PAINEL });
const pontos = (e) => e.jogadores.map((j) => j.pontos);

describe('roleta', () => {
  it('o sorteio define a fatia', () => {
    expect(girar(partida(), 0).valorRoleta).toBe(FATIAS_ROLETA[0].valor);
    expect(girar(partida(), 0.999).valorRoleta).toBe(FATIAS_ROLETA[FATIAS_ROLETA.length - 1].valor);
  });

  it('não gira de novo antes de usar o giro', () => {
    const e = girar(partida());
    expect(podeGirar(e)).toBe(false);
    expect(girar(e, 0.5)).toBe(e);
  });

  it('não tem fatia punitiva', () => {
    expect(FATIAS_ROLETA.filter((f) => f.tipo === 'pontos').every((f) => f.valor > 0)).toBe(true);
  });

  it('os limites das fatias cobrem de 0 a 1 sem buracos, e fatia estreita ocupa menos', () => {
    const limites = limitesDasFatias();
    expect(limites[0].inicio).toBe(0);
    expect(limites[limites.length - 1].fim).toBeCloseTo(1, 10);
    limites.slice(1).forEach((l, i) => expect(l.inicio).toBe(limites[i].fim));
    const largura = (i) => limites[i].fim - limites[i].inicio;
    const jackpot = FATIAS_ROLETA.findIndex((f) => f.jackpot);
    const comum = FATIAS_ROLETA.findIndex((f) => !f.peso);
    expect(largura(jackpot)).toBeLessThan(largura(comum));
  });

  it('o sorteio cai em cada fatia na proporção da sua largura', () => {
    const limites = limitesDasFatias();
    limites.forEach((l, i) => {
      expect(indiceDaFatia(l.inicio)).toBe(i);
      expect(indiceDaFatia((l.inicio + l.fim) / 2)).toBe(i);
    });
    expect(indiceDaFatia(0.9999999)).toBe(limites.length - 1);
  });

  it('a fatia de 100 pontos paga como qualquer fatia de pontos', () => {
    const indice = FATIAS_ROLETA.findIndex((f) => f.jackpot);
    const { inicio, fim } = limitesDasFatias()[indice];
    const e = letra(girar(partida(), (inicio + fim) / 2), 'C');
    expect(pontos(e)).toEqual([FATIAS_ROLETA[indice].valor * 2, 0]);
  });

  it('não existe no cooperativo', () => {
    const e = partida(MODOS.COOPERATIVO);
    expect(girar(e)).toBe(e);
  });
});

describe('letras no competitivo', () => {
  it('não aceita letra antes de girar', () => {
    const e = partida();
    expect(letra(e, 'C')).toBe(e);
  });

  it('letra certa paga por casa aberta e mantém a vez', () => {
    const e = letra(girar(partida()), 'C');
    expect(pontos(e)).toEqual([20, 0]);
    expect(e.vez).toBe(0);
    expect(e.valorRoleta).toBeNull();
    expect(e.ultimaJogada).toEqual({ tipo: JOGADAS.LETRA_CERTA, letra: 'C', quantidade: 2, pontos: 20, quem: 0 });
  });

  it('letra errada não tira pontos e passa a vez', () => {
    let e = letra(girar(partida()), 'C');
    e = letra(girar(e), 'Z');
    expect(pontos(e)).toEqual([20, 0]);
    expect(e.vez).toBe(1);
    expect(e.ultimaJogada.tipo).toBe(JOGADAS.LETRA_ERRADA);
  });

  it('ignora letra repetida ou fora do teclado', () => {
    const e = girar(letra(girar(partida()), 'C'));
    expect(letra(e, 'C')).toBe(e);
    expect(letra(e, 'Ç')).toBe(e);
  });

  it('abrir a última letra resolve o painel', () => {
    let e = letra(girar(partida()), 'C');
    e = letra(girar(e), 'O');
    expect(e.fase).toBe(FASES.RESOLVIDO);
    expect(e.ganho).toBe(20);
    expect(pontos(e)).toEqual([40, 0]);
  });

  it('a pontuação de letra usa o multiplicador do painel', () => {
    let e = proximo(resolver(partida(), 'COCO'));
    const quem = e.vez;
    e = letra(girar(e), 'P');
    expect(e.jogadores[quem].pontos).toBe(10 * 1 * 2);
  });

  it('acentos abrem junto: A conta o Ã', () => {
    const e = criarPartida({
      modo: MODOS.COMPETITIVO,
      nivel: 'avancado',
      jogadores: [{ id: 'a' }, { id: 'b' }],
      rodada: { tema: 'T', paineis: [painel('PÃO DA MANHÃ')] },
    });
    expect(letra(girar(e), 'A').ultimaJogada.quantidade).toBe(4);
  });
});

describe('resolver', () => {
  it('certo paga 20 por casa fechada, com multiplicador', () => {
    const e = resolver(partida(), 'COCO');
    expect(e.fase).toBe(FASES.RESOLVIDO);
    expect(e.ganho).toBe(80);
    expect(pontos(e)).toEqual([80, 0]);

    const segundo = resolver(proximo(e), 'PATO');
    expect(segundo.ganho).toBe(20 * 4 * 2);
    expect(pontos(segundo)).toEqual([80, 160]);
  });

  it('errado risca a opção, passa a vez e perde o giro', () => {
    const e = resolver(girar(partida()), 'ERRADA');
    expect(e.descartadas).toEqual(['ERRADA']);
    expect(e.vez).toBe(1);
    expect(e.valorRoleta).toBeNull();
    expect(e.ultimaJogada.tipo).toBe(JOGADAS.CHUTE_ERRADO);
    expect(pontos(e)).toEqual([0, 0]);
  });

  it('ignora opção riscada ou inexistente', () => {
    const e = resolver(partida(), 'ERRADA');
    expect(resolver(e, 'ERRADA')).toBe(e);
    expect(resolver(e, 'NADA')).toBe(e);
  });

  it('não aceita jogadas com o painel já resolvido', () => {
    const e = resolver(partida(), 'COCO');
    expect(resolver(e, 'ERRADA')).toBe(e);
    expect(girar(e)).toBe(e);
    expect(letra(e, 'Z')).toBe(e);
  });
});

describe('resolver preenchendo as casas (sem opções)', () => {
  function partidaSemOpcoes(texto) {
    return criarPartida({
      modo: MODOS.COMPETITIVO,
      nivel: 'avancado',
      jogadores: [{ id: 'a' }, { id: 'b' }],
      rodada: { tema: 'T', paineis: [{ texto, letras: ALFABETO, opcoes: null }] },
    });
  }

  it('aceita a resposta sem acentos e paga as casas fechadas', () => {
    const e = resolver(partidaSemOpcoes('PÃO COM MEL'), 'PAO COM MEL');
    expect(e.fase).toBe(FASES.RESOLVIDO);
    expect(e.ganho).toBe(20 * 9);
  });

  it('errar passa a vez, conta erro e não risca nada', () => {
    const e = resolver(partidaSemOpcoes('PÃO COM MEL'), 'PAO COM SAL');
    expect(e.fase).toBe(FASES.JOGANDO);
    expect(e.vez).toBe(1);
    expect(e.erros).toBe(1);
    expect(e.descartadas).toEqual([]);
    expect(e.ultimaJogada).toEqual({ tipo: JOGADAS.CHUTE_ERRADO, resposta: 'PAO COM SAL', quem: 0 });
  });

  it('ignora resposta incompleta', () => {
    const e = partidaSemOpcoes('PÃO COM MEL');
    expect(resolver(e, 'PAO COM')).toBe(e);
  });
});

describe('cooperativo', () => {
  it('escolhe letra sem girar e passa a vez mesmo acertando', () => {
    const e = letra(partida(MODOS.COOPERATIVO), 'C');
    expect(e.vez).toBe(1);
    expect(e.erros).toBe(0);
    expect(pontos(e)).toEqual([0, 0]);
  });

  it('estrelas dependem dos erros', () => {
    expect([0, 1, 2, 3, 4, 5, 9].map(calcularEstrelas)).toEqual([3, 3, 3, 2, 2, 1, 1]);
  });

  it('letras e chutes errados contam como erro', () => {
    let e = partida(MODOS.COOPERATIVO);
    for (const l of ['Z', 'X', 'W']) e = letra(e, l);
    e = resolver(e, 'ERRADA');
    e = resolver(e, 'COCO');
    expect(e.erros).toBe(4);
    expect(e.ganho).toBe(2);
    expect(e.estrelas).toBe(2);
  });

  it('chega ao máximo de 9 estrelas', () => {
    let e = partida(MODOS.COOPERATIVO);
    e = proximo(resolver(e, 'COCO'));
    e = proximo(resolver(e, 'PATO'));
    e = proximo(resolver(e, 'GALO'));
    expect(calcularResultado(e)).toEqual({ estrelas: 9, maximo: 9 });
  });
});

describe('próximo painel e fim', () => {
  it('só avança depois de resolvido', () => {
    const e = partida();
    expect(proximo(e)).toBe(e);
  });

  it('começa com o jogador seguinte a quem resolveu e limpa o painel', () => {
    let e = partida(MODOS.COMPETITIVO, 3);
    e = letra(girar(e), 'Z');
    e = resolver(e, 'COCO');
    e = proximo(e);
    expect(e.indicePainel).toBe(1);
    expect(e.vez).toBe(2);
    expect(e.letrasUsadas).toEqual([]);
    expect(e.descartadas).toEqual([]);
    expect(e.erros).toBe(0);
    expect(e.fase).toBe(FASES.JOGANDO);
  });

  it('termina após o terceiro painel, com o vencedor correto', () => {
    let e = partida();
    e = proximo(resolver(e, 'COCO'));
    e = proximo(resolver(e, 'PATO'));
    e = proximo(resolver(e, 'GALO'));
    expect(e.fase).toBe(FASES.FIM);
    expect(pontos(e)).toEqual([80 + 240, 160]);
    expect(calcularResultado(e).vencedores.map((j) => j.id)).toEqual(['j0']);
  });

  it('aceita empate', () => {
    const e = { ...partida(), jogadores: [{ id: 'a', pontos: 30 }, { id: 'b', pontos: 30 }] };
    expect(calcularResultado(e).vencedores).toHaveLength(2);
  });
});

describe('saída e queda de jogador (online)', () => {
  function partidaDe3() {
    return criarPartida({
      modo: MODOS.COMPETITIVO,
      nivel: 'avancado',
      jogadores: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
      rodada: { tema: 'T', paineis: [{ texto: 'PATO', letras: ['P', 'A', 'T', 'O', 'X'], opcoes: null }] },
    });
  }

  it('passar a vez não tira pontos nem conta erro e descarta o giro', () => {
    let e = aplicarAcao(partidaDe3(), { tipo: ACOES.GIRAR, sorteio: 0 });
    e = aplicarAcao(e, { tipo: ACOES.PASSAR_VEZ });
    expect(e.vez).toBe(1);
    expect(e.valorRoleta).toBeNull();
    expect(e.erros).toBe(0);
    expect(e.jogadores.map((j) => j.pontos)).toEqual([0, 0, 0]);
  });

  it('quem saiu não vence, mesmo com mais pontos, e fica no fim do placar', () => {
    const inicial = partidaDe3();
    const comPontos = { ...inicial, jogadores: inicial.jogadores.map((j, i) => ({ ...j, pontos: i === 0 ? 100 : 10 * i })) };
    const e = aplicarAcao(comPontos, { tipo: ACOES.MARCAR_SAIDA, indice: 0 });
    const resultado = calcularResultado(e);
    expect(resultado.vencedores.map((j) => j.pontos)).toEqual([20]);
    expect(resultado.ranking[resultado.ranking.length - 1].saiu).toBe(true);
  });

  it('marca quando a partida acabou porque sobrou uma pessoa', () => {
    let e = aplicarAcao(partidaDe3(), { tipo: ACOES.MARCAR_SAIDA, indice: 0 });
    expect(e.encerradaPorSaida).toBeUndefined();
    e = aplicarAcao(e, { tipo: ACOES.MARCAR_SAIDA, indice: 1 });
    expect(e.encerradaPorSaida).toBe(true);
  });

  it('quem saiu é pulado na vez', () => {
    let e = aplicarAcao(partidaDe3(), { tipo: ACOES.MARCAR_SAIDA, indice: 1 });
    expect(e.vez).toBe(0);
    e = aplicarAcao(e, { tipo: ACOES.PASSAR_VEZ });
    expect(e.vez).toBe(2);
  });

  it('se quem saiu estava na vez, a vez passa', () => {
    const e = aplicarAcao(partidaDe3(), { tipo: ACOES.MARCAR_SAIDA, indice: 0 });
    expect(e.vez).toBe(1);
  });

  it('sobrando uma pessoa, a partida termina', () => {
    let e = aplicarAcao(partidaDe3(), { tipo: ACOES.MARCAR_SAIDA, indice: 0 });
    e = aplicarAcao(e, { tipo: ACOES.MARCAR_SAIDA, indice: 1 });
    expect(e.fase).toBe(FASES.FIM);
  });
});

describe('relógio da vez', () => {
  const tempoEsgotado = (e) => aplicarAcao(e, { tipo: ACOES.TEMPO_ESGOTADO });

  it('acabou o tempo: a vez passa, sem erro, sem perder pontos e descartando o giro', () => {
    let e = girar(partida(), 0);
    e = tempoEsgotado(e);
    expect(e.vez).toBe(1);
    expect(e.valorRoleta).toBeNull();
    expect(e.erros).toBe(0);
    expect(pontos(e)).toEqual([0, 0]);
    expect(e.ultimaJogada).toEqual({ tipo: JOGADAS.TEMPO_ESGOTADO, quem: 0 });
  });

  it('o turno sobe a cada ação que muda o jogo, mas não ao girar', () => {
    let e = partida();
    expect(e.turno).toBe(0);
    e = girar(e, 0);
    expect(e.turno).toBe(0);
    e = letra(e, 'C');
    expect(e.vez).toBe(0);
    expect(e.turno).toBe(1);
    e = tempoEsgotado(e);
    expect(e.turno).toBe(2);
  });

  it('ação inválida não mexe no turno', () => {
    const e = partida();
    expect(letra(e, 'C')).toBe(e);
    expect(e.turno).toBe(0);
  });

  it('só existe no competitivo e com o painel aberto', () => {
    expect(temRelogio(partida())).toBe(true);
    expect(temRelogio(partida(MODOS.COOPERATIVO))).toBe(false);
    const coop = partida(MODOS.COOPERATIVO);
    expect(tempoEsgotado(coop)).toBe(coop);
    const resolvido = resolver(partida(), 'COCO');
    expect(temRelogio(resolvido)).toBe(false);
    expect(tempoEsgotado(resolvido)).toBe(resolvido);
  });

  it('quem saiu é pulado quando o tempo acaba', () => {
    let e = aplicarAcao(partida(MODOS.COMPETITIVO, 3), { tipo: ACOES.MARCAR_SAIDA, indice: 1 });
    e = tempoEsgotado(e);
    expect(e.vez).toBe(2);
  });
});

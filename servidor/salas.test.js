import { beforeEach, describe, expect, it } from 'vitest';
import { ACOES, FASES } from '../src/logica/jogo.js';
import { contarCasasFechadas } from '../src/logica/texto.js';
import { codigoValido, gerarCodigo } from './codigo.js';
import { RESULTADO_VISIVEL_MS, SALA_PARADA_MS } from './regrasOnline.js';
import { CONEXAO, FASES_DA_SALA, criarGerenciador } from './salas.js';
import { visaoDaPartida, visaoDaSala } from './visao.js';

const PALAVRAS = [
  {
    tema: 'Bichos',
    itens: [
      { texto: 'PATO', emoji: 'x' },
      { texto: 'GATO', emoji: 'x' },
      { texto: 'BOLA', emoji: 'x' },
      { texto: 'CASA', emoji: 'x' },
      { texto: 'MESA', emoji: 'x' },
      { texto: 'LUA', emoji: 'x' },
    ],
  },
];

const T = 1000;
let g;

beforeEach(() => {
  g = criarGerenciador({ carregarPalavras: async () => PALAVRAS, limites: { vagaMs: 120, vezMs: 60 } });
});

function salaCom2(nivel = 'avancado') {
  const a = g.criarSala({ nivel, personagemId: 'lala' }, T);
  const b = g.entrarNaSala({ codigo: a.sala.codigo, personagemId: 'boris' }, T);
  return { codigo: a.sala.codigo, tokenA: a.jogador.token, tokenB: b.jogador.token, sala: a.sala };
}

async function partida(nivel) {
  const s = salaCom2(nivel);
  await g.comecar({ codigo: s.codigo, token: s.tokenA }, T);
  return s;
}

const jogar = (s, token, pedido, t = T) => g.jogar({ codigo: s.codigo, token, pedido }, t);

describe('código', () => {
  it('tem o formato certo e não forma palavras: sem vogais', () => {
    for (let i = 0; i < 200; i++) {
      const codigo = gerarCodigo();
      expect(codigoValido(codigo)).toBe(true);
      expect(codigo).not.toMatch(/[AEIOU]/);
    }
  });

  it('recusa formatos errados', () => {
    for (const c of ['GATO-42', 'BCDF42', 'bcdf-42', '', null, 5, {}, 'BCDF-4']) expect(codigoValido(c)).toBe(false);
  });
});

describe('criar e entrar', () => {
  it('quem cria é o anfitrião', () => {
    const { sala, jogador } = g.criarSala({ nivel: 'iniciante', personagemId: 'lala' }, T);
    expect(sala.anfitriaoId).toBe(jogador.id);
    expect(sala.fase).toBe(FASES_DA_SALA.AGUARDANDO);
  });

  it('recusa nível e personagem inválidos', () => {
    expect(g.criarSala({ nivel: 'x', personagemId: 'lala' }, T).erro).toBe('nivel-invalido');
    expect(g.criarSala({ nivel: 'iniciante', personagemId: 'x' }, T).erro).toBe('personagem-invalido');
  });

  it('o nome é sempre o do personagem: não há como mandar texto livre', () => {
    const { jogador } = g.criarSala({ nivel: 'iniciante', personagemId: 'lala', nome: 'Maria Silva' }, T);
    expect(jogador.nome).toBe('Lalá Lápis');
  });

  it('não deixa repetir personagem nem passar de 4', () => {
    const { codigo } = salaCom2();
    expect(g.entrarNaSala({ codigo, personagemId: 'lala' }, T).erro).toBe('personagem-ocupado');
    g.entrarNaSala({ codigo, personagemId: 'til' }, T);
    g.entrarNaSala({ codigo, personagemId: 'tito' }, T);
    expect(g.entrarNaSala({ codigo, personagemId: 'zuca' }, T).erro).toBe('sala-cheia');
  });

  it('código errado não encontra sala', () => {
    expect(g.entrarNaSala({ codigo: 'BCDF-00', personagemId: 'lala' }, T).erro).toBe('sala-nao-encontrada');
  });

  it('a consulta mostra só o nível e os personagens ocupados', () => {
    const { codigo } = salaCom2();
    expect(g.consultarSala(codigo)).toEqual({ ok: true, nivel: 'avancado', ocupados: ['lala', 'boris'] });
  });

  it('só o anfitrião começa, e com ao menos 2 jogadoras', async () => {
    const a = g.criarSala({ nivel: 'avancado', personagemId: 'lala' }, T);
    const { codigo } = a.sala;
    expect((await g.comecar({ codigo, token: a.jogador.token }, T)).erro).toBe('faltam-jogadores');
    const b = g.entrarNaSala({ codigo, personagemId: 'boris' }, T);
    expect((await g.comecar({ codigo, token: b.jogador.token }, T)).erro).toBe('so-anfitriao');
    expect((await g.comecar({ codigo, token: a.jogador.token }, T)).ok).toBe(true);
    expect(g.entrarNaSala({ codigo, personagemId: 'til' }, T).erro).toBe('partida-comecou');
  });
});

describe('jogadas: o servidor é a autoridade', () => {
  it('quem não está na vez não joga', async () => {
    const s = await partida();
    expect(jogar(s, s.tokenB, { tipo: ACOES.GIRAR }).erro).toBe('nao-e-sua-vez');
    expect(jogar(s, 'token-falso', { tipo: ACOES.GIRAR }).erro).toBe('vaga-perdida');
  });

  it('ignora o sorteio enviado pelo aparelho', async () => {
    const g2 = criarGerenciador({ carregarPalavras: async () => PALAVRAS, rng: () => 0 });
    const a = g2.criarSala({ nivel: 'avancado', personagemId: 'lala' }, T);
    g2.entrarNaSala({ codigo: a.sala.codigo, personagemId: 'boris' }, T);
    await g2.comecar({ codigo: a.sala.codigo, token: a.jogador.token }, T);
    g2.jogar({ codigo: a.sala.codigo, token: a.jogador.token, pedido: { tipo: ACOES.GIRAR, sorteio: 0.99 } }, T);
    expect(a.sala.partida.valorRoleta).toBe(10); // primeira fatia, a do rng do servidor
    expect(a.sala.giro).toEqual({ numero: 1, fatia: 0 });
  });

  it('recusa pedidos malformados sem quebrar', async () => {
    const s = await partida();
    for (const pedido of [null, 5, 'x', {}, { tipo: 'HACK' }, { tipo: ACOES.ESCOLHER_LETRA, letra: 'AB' }, { tipo: ACOES.ESCOLHER_LETRA, letra: 1 }, { tipo: ACOES.RESOLVER, resposta: 'x'.repeat(61) }, { tipo: ACOES.MARCAR_SAIDA, indice: 1 }, { tipo: ACOES.PASSAR_VEZ }]) {
      expect(jogar(s, s.tokenA, pedido).ok).toBe(false);
    }
  });

  it('a partida vai até o fim', async () => {
    const s = await partida();
    for (let i = 0; i < 3; i++) {
      const { paineis, indicePainel, vez } = s.sala.partida;
      const token = vez === 0 ? s.tokenA : s.tokenB;
      expect(jogar(s, token, { tipo: ACOES.RESOLVER, resposta: paineis[indicePainel].texto }).ok).toBe(true);
      expect(jogar(s, token, { tipo: ACOES.PROXIMO_PAINEL }).ok).toBe(true);
    }
    expect(s.sala.fase).toBe(FASES_DA_SALA.FIM);
  });
});

describe('o que cada aparelho recebe', () => {
  it('nunca recebe a resposta antes da hora', async () => {
    const s = await partida();
    const visao = visaoDaPartida(s.sala.partida);
    const respostas = s.sala.partida.paineis.map((p) => p.texto);
    const json = JSON.stringify(visao);
    for (const resposta of respostas) expect(json).not.toContain(resposta);
    expect(visao.paineis[0].texto).toMatch(/^_+$/);
    expect(visao.paineis[1]).toEqual({});
  });

  it('o texto escondido abre só as letras usadas, e a contagem de casas continua certa', async () => {
    const s = await partida();
    const partidaReal = s.sala.partida;
    const texto = partidaReal.paineis[0].texto;
    const letra = texto[0];
    jogar(s, s.tokenA, { tipo: ACOES.GIRAR });
    jogar(s, s.tokenA, { tipo: ACOES.ESCOLHER_LETRA, letra });
    const atual = s.sala.partida;
    if (atual.fase === FASES.JOGANDO) {
      const escondido = visaoDaPartida(atual).paineis[0].texto;
      expect(escondido).toContain(letra);
      expect(contarCasasFechadas(escondido, atual.letrasUsadas)).toBe(contarCasasFechadas(texto, atual.letrasUsadas));
    }
  });

  it('mostra a resposta quando o painel é resolvido', async () => {
    const s = await partida();
    const { texto } = s.sala.partida.paineis[0];
    jogar(s, s.tokenA, { tipo: ACOES.RESOLVER, resposta: texto });
    expect(visaoDaPartida(s.sala.partida).paineis[0].texto).toBe(texto);
  });

  it('resposta errada digitada não chega aos outros: seria um chat livre', async () => {
    const s = await partida();
    const { texto } = s.sala.partida.paineis[0];
    const recado = 'Z'.repeat(texto.length);
    jogar(s, s.tokenA, { tipo: ACOES.RESOLVER, resposta: recado });
    expect(s.sala.partida.ultimaJogada.resposta).toBe(recado);
    expect(JSON.stringify(visaoDaPartida(s.sala.partida))).not.toContain(recado);
  });

  it('nenhum token aparece na visão', async () => {
    const s = await partida();
    const json = JSON.stringify(visaoDaSala(s.sala, 'lala', T));
    expect(json).not.toContain(s.tokenA);
    expect(json).not.toContain(s.tokenB);
  });
});

describe('quem caiu e quem saiu', () => {
  it('quem cai fica reconectando e volta pela mesma vaga', async () => {
    const s = await partida();
    g.marcarQueda({ codigo: s.codigo, token: s.tokenB }, T);
    expect(s.sala.jogadores[1].conexao).toBe(CONEXAO.RECONECTANDO);
    expect(g.retomar({ codigo: s.codigo, token: s.tokenB }, T + 10).ok).toBe(true);
    expect(s.sala.jogadores[1].conexao).toBe(CONEXAO.CONECTADA);
  });

  it('token errado não retoma', () => {
    const s = salaCom2();
    expect(g.retomar({ codigo: s.codigo, token: 'x' }, T).erro).toBe('vaga-perdida');
  });

  it('caiu na própria vez: a vez passa depois da espera, sem perder pontos', async () => {
    const s = await partida();
    g.marcarQueda({ codigo: s.codigo, token: s.tokenA }, T);
    expect(s.sala.vezOfflineDesde).toBe(T);
    g.verificarPrazos(T + 59);
    expect(s.sala.partida.vez).toBe(0);
    g.verificarPrazos(T + 60);
    expect(s.sala.partida.vez).toBe(1);
    expect(s.sala.partida.jogadores[0].pontos).toBe(0);
  });

  it('voltar a tempo cancela a passagem da vez', async () => {
    const s = await partida();
    g.marcarQueda({ codigo: s.codigo, token: s.tokenA }, T);
    g.retomar({ codigo: s.codigo, token: s.tokenA }, T + 30);
    g.verificarPrazos(T + 100);
    expect(s.sala.partida.vez).toBe(0);
  });

  it('passou da vaga guardada: saiu, e com uma só a partida termina', async () => {
    const s = await partida();
    g.marcarQueda({ codigo: s.codigo, token: s.tokenB }, T);
    g.verificarPrazos(T + 120);
    expect(s.sala.jogadores[1].conexao).toBe(CONEXAO.SAIU);
    expect(s.sala.fase).toBe(FASES_DA_SALA.FIM);
    expect(g.retomar({ codigo: s.codigo, token: s.tokenB }, T + 121).erro).toBe('vaga-perdida');
  });

  it('no lobby, quem sai libera o personagem e o anfitrião passa adiante', () => {
    const s = salaCom2();
    g.sair({ codigo: s.codigo, token: s.tokenA }, T);
    expect(s.sala.anfitriaoId).toBe('boris');
    expect(g.entrarNaSala({ codigo: s.codigo, personagemId: 'lala' }, T).ok).toBe(true);
  });

  it('sem ninguém, a sala é apagada', () => {
    const s = salaCom2();
    g.sair({ codigo: s.codigo, token: s.tokenA }, T);
    g.sair({ codigo: s.codigo, token: s.tokenB }, T);
    expect(g.total()).toBe(0);
  });

  it('quem resolveu e caiu não trava o próximo painel', async () => {
    const s = await partida();
    const { texto } = s.sala.partida.paineis[0];
    jogar(s, s.tokenA, { tipo: ACOES.RESOLVER, resposta: texto });
    expect(jogar(s, s.tokenB, { tipo: ACOES.PROXIMO_PAINEL }).erro).toBe('nao-e-sua-vez');
    g.marcarQueda({ codigo: s.codigo, token: s.tokenA }, T);
    expect(jogar(s, s.tokenB, { tipo: ACOES.PROXIMO_PAINEL }).ok).toBe(true);
  });
});

describe('nada fica guardado', () => {
  it('sala terminada e sala parada são apagadas', async () => {
    const s = await partida();
    for (let i = 0; i < 3; i++) {
      const { paineis, indicePainel, vez } = s.sala.partida;
      const token = vez === 0 ? s.tokenA : s.tokenB;
      jogar(s, token, { tipo: ACOES.RESOLVER, resposta: paineis[indicePainel].texto });
      jogar(s, token, { tipo: ACOES.PROXIMO_PAINEL });
    }
    expect(g.total()).toBe(1);
    g.verificarPrazos(T + RESULTADO_VISIVEL_MS);
    expect(g.total()).toBe(0);

    const parada = salaCom2();
    expect(g.verificarPrazos(T + SALA_PARADA_MS).apagadas.map((x) => x.codigo)).toEqual([parada.codigo]);
    expect(g.total()).toBe(0);
  });

  it('limita o número de salas', () => {
    const g2 = criarGerenciador({ carregarPalavras: async () => PALAVRAS, limites: { maxSalas: 1 } });
    g2.criarSala({ nivel: 'iniciante', personagemId: 'lala' }, T);
    expect(g2.criarSala({ nivel: 'iniciante', personagemId: 'lala' }, T).erro).toBe('servidor-cheio');
  });
});

// Teste de ponta a ponta: servidor real e clientes reais do Socket.IO, na rede local da máquina.
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { io as conectar } from 'socket.io-client';
import { ACOES } from '../src/logica/jogo.js';
import { criarAplicacao } from './aplicacao.js';

const PALAVRAS = [
  { tema: 'Bichos', itens: ['PATO', 'GATO', 'BOLA', 'CASA', 'MESA', 'LUA'].map((texto) => ({ texto, emoji: 'x' })) },
];
const ORIGEM = 'http://site-do-jogo.test';

let app;
let porta;
let clientes;

function cliente(extraHeaders = { origin: ORIGEM }) {
  const socket = conectar(`http://127.0.0.1:${porta}`, { transports: ['websocket'], extraHeaders, reconnection: false, forceNew: true });
  clientes.push(socket);
  return socket;
}

const conectado = (s) => new Promise((ok, falha) => {
  s.once('connect', ok);
  s.once('connect_error', falha);
});
const pedir = (s, nome, dados) => s.timeout(2000).emitWithAck(nome, dados);
const proximaSala = (s, condicao = () => true) => new Promise((ok) => {
  const ouvir = (v) => {
    if (condicao(v)) {
      s.off('sala', ouvir);
      ok(v);
    }
  };
  s.on('sala', ouvir);
});

beforeEach(async () => {
  clientes = [];
  app = criarAplicacao({ carregarPalavras: async () => PALAVRAS, origens: [ORIGEM] });
  await new Promise((ok) => {
    app.http.listen(0, '127.0.0.1', ok);
  });
  porta = app.http.address().port;
});

afterEach(async () => {
  clientes.forEach((s) => s.disconnect());
  await app.fechar();
});

async function duasNaSala() {
  const a = cliente();
  const b = cliente();
  await Promise.all([conectado(a), conectado(b)]);
  const criada = await pedir(a, 'criar_sala', { nivel: 'avancado', personagemId: 'lala' });
  expect(criada.ok).toBe(true);
  const entrou = await pedir(b, 'entrar_sala', { codigo: criada.codigo, personagemId: 'boris' });
  expect(entrou.ok).toBe(true);
  return { a, b, codigo: criada.codigo, tokenA: criada.token, tokenB: entrou.token };
}

describe('servidor pela rede', () => {
  it('recusa conexão vinda de outro site', async () => {
    const intruso = cliente({ origin: 'https://outro-site.test' });
    await expect(conectado(intruso)).rejects.toBeTruthy();
  });

  it('responde à checagem de saúde e não expõe mais nada', async () => {
    expect((await fetch(`http://127.0.0.1:${porta}/saude`)).status).toBe(200);
    expect((await fetch(`http://127.0.0.1:${porta}/qualquer`)).status).toBe(404);
  });

  it('duas pessoas veem a mesma sala, e a presença aparece para as duas', async () => {
    const { a, b, codigo } = await duasNaSala();
    const espera = proximaSala(a, (v) => v.partida);
    const esperaB = proximaSala(b, (v) => v.partida);
    expect((await pedir(a, 'comecar')).ok).toBe(true);
    const [va, vb] = await Promise.all([espera, esperaB]);
    expect(va.codigo).toBe(codigo);
    expect(va.voceId).toBe('lala');
    expect(vb.voceId).toBe('boris');
    expect(va.jogadores.map((j) => j.conexao)).toEqual(['conectada', 'conectada']);
    expect(JSON.stringify(vb)).not.toMatch(/PATO|GATO|BOLA|CASA|MESA|LUA/);
  });

  it('a jogada de uma aparece para a outra, e a fora de vez é recusada', async () => {
    const { a, b } = await duasNaSala();
    await pedir(a, 'comecar');
    expect((await pedir(b, 'jogada', { pedido: { tipo: ACOES.GIRAR } })).erro).toBe('nao-e-sua-vez');
    const espera = proximaSala(b, (v) => v.giro);
    expect((await pedir(a, 'jogada', { pedido: { tipo: ACOES.GIRAR } })).ok).toBe(true);
    const visao = await espera;
    expect(visao.giro.numero).toBe(1);
    expect(visao.partida.valorRoleta).toBeGreaterThan(0);
  });

  it('quem cai aparece como reconectando e volta com o token', async () => {
    const { a, b, codigo, tokenB } = await duasNaSala();
    const caiu = proximaSala(a, (v) => v.jogadores[1].conexao === 'reconectando');
    b.disconnect();
    await caiu;
    const nova = cliente();
    await conectado(nova);
    const voltou = proximaSala(a, (v) => v.jogadores[1].conexao === 'conectada');
    expect((await pedir(nova, 'retomar', { codigo, token: tokenB })).ok).toBe(true);
    await voltou;
  });

  it('dados malformados não derrubam o servidor', async () => {
    const a = cliente();
    await conectado(a);
    for (const dados of [null, 5, 'x', [], { codigo: {} }, { codigo: 5, personagemId: [] }]) {
      expect((await pedir(a, 'entrar_sala', dados)).ok).toBe(false);
    }
    expect((await pedir(a, 'criar_sala', { nivel: 'avancado', personagemId: 'lala' })).ok).toBe(true);
  });

  it('bloqueia quem tenta adivinhar códigos', async () => {
    const a = cliente();
    await conectado(a);
    let ultimo;
    for (let i = 0; i < 11; i++) ultimo = await pedir(a, 'consultar_sala', { codigo: 'BCDF-00' });
    expect(ultimo.erro).toBe('muitas-tentativas');
  });

  it('limita salas criadas por endereço', async () => {
    let ultimo;
    for (let i = 0; i < 6; i++) {
      const s = cliente();
      await conectado(s);
      ultimo = await pedir(s, 'criar_sala', { nivel: 'avancado', personagemId: 'lala' });
    }
    expect(ultimo.erro).toBe('muitas-salas');
  });

  it('a mesma conexão não ocupa duas vagas', async () => {
    const { a, codigo } = await duasNaSala();
    expect((await pedir(a, 'entrar_sala', { codigo, personagemId: 'til' })).erro).toBe('ja-em-sala');
  });
});

// Liga as salas à rede com Socket.IO. Não grava nada e não registra endereços nem jogadas.
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { criarLimitador } from './limites.js';
import {
  JANELA_DE_LIMITE_MS,
  LIMITE_CODIGOS_ERRADOS,
  LIMITE_SALAS_CRIADAS,
  MAX_EVENTOS_POR_SEGUNDO,
} from './regrasOnline.js';
import { criarGerenciador } from './salas.js';
import { visaoDaSala } from './visao.js';

const INTERVALO_DOS_PRAZOS_MS = 1000;

function enderecoDe(socket) {
  // Atrás do Cloudflare Tunnel, o endereço real vem neste cabeçalho.
  return socket.handshake.headers['cf-connecting-ip'] || socket.handshake.address;
}

// `rng` só existe para os testes escolherem a fatia da roleta; em produção vale o sorteio do servidor.
export function criarAplicacao({ carregarPalavras, origens, agora = Date.now, limites, rng } = {}) {
  const gerenciador = criarGerenciador({ carregarPalavras, limites, rng });
  const http = createServer((pedido, resposta) => {
    if (pedido.url === '/saude') {
      resposta.writeHead(200, { 'Content-Type': 'text/plain' });
      resposta.end('ok');
      return;
    }
    resposta.writeHead(404);
    resposta.end();
  });

  const io = new Server(http, {
    serveClient: false,
    maxHttpBufferSize: 4096,
    // Detecta queda em menos de 20 segundos.
    pingInterval: 10000,
    pingTimeout: 8000,
    // Só o site do jogo conecta. Aparelho sem Origin não vem de navegador em outro site.
    allowRequest: (pedido, decidir) => {
      const origem = pedido.headers.origin;
      decidir(null, !origem || origens.includes(origem));
    },
  });

  const codigosErrados = criarLimitador(LIMITE_CODIGOS_ERRADOS, JANELA_DE_LIMITE_MS);
  const salasCriadas = criarLimitador(LIMITE_SALAS_CRIADAS, JANELA_DE_LIMITE_MS);
  const conexoes = new Map(); // token -> socket

  function enviarSala(sala) {
    for (const jogador of sala.jogadores) {
      const socket = conexoes.get(jogador.token);
      if (socket) socket.emit('sala', visaoDaSala(sala, jogador.id, agora()));
    }
  }

  function vincular(socket, sala, jogador) {
    const anterior = conexoes.get(jogador.token);
    if (anterior && anterior !== socket) {
      // O mesmo jogador abriu em outro lugar: vale a conexão nova.
      anterior.data.vaga = null;
      anterior.disconnect(true);
    }
    conexoes.set(jogador.token, socket);
    socket.data.vaga = { codigo: sala.codigo, token: jogador.token };
  }

  function desvincular(socket) {
    const vaga = socket.data.vaga;
    if (vaga && conexoes.get(vaga.token) === socket) conexoes.delete(vaga.token);
    socket.data.vaga = null;
    return vaga;
  }

  io.on('connection', (socket) => {
    const endereco = enderecoDe(socket);
    const eventos = criarLimitador(MAX_EVENTOS_POR_SEGUNDO, 1000);

    // Todo evento passa por aqui: entrada malformada ou em excesso nunca derruba o servidor.
    function ao(nome, tratar) {
      socket.on(nome, async (dados, responder) => {
        const responda = typeof responder === 'function' ? responder : () => {};
        if (eventos.excedeu(socket.id, agora())) return responda({ ok: false, erro: 'muitas-acoes' });
        eventos.registrar(socket.id, agora());
        try {
          responda(await tratar(dados && typeof dados === 'object' ? dados : {}));
        } catch {
          responda({ ok: false, erro: 'erro-interno' });
        }
        return undefined;
      });
    }

    function tentativaBloqueada() {
      return codigosErrados.excedeu(endereco, agora());
    }

    function contarErro(resultado) {
      if (!resultado.ok && resultado.erro === 'sala-nao-encontrada') codigosErrados.registrar(endereco, agora());
      return resultado;
    }

    ao('criar_sala', ({ nivel, personagemId }) => {
      if (socket.data.vaga) return { ok: false, erro: 'ja-em-sala' };
      if (salasCriadas.excedeu(endereco, agora())) return { ok: false, erro: 'muitas-salas' };
      const resultado = gerenciador.criarSala({ nivel, personagemId }, agora());
      if (!resultado.ok) return resultado;
      salasCriadas.registrar(endereco, agora());
      vincular(socket, resultado.sala, resultado.jogador);
      enviarSala(resultado.sala);
      return { ok: true, codigo: resultado.sala.codigo, token: resultado.jogador.token };
    });

    ao('consultar_sala', ({ codigo }) => {
      if (tentativaBloqueada()) return { ok: false, erro: 'muitas-tentativas' };
      return contarErro(gerenciador.consultarSala(codigo));
    });

    ao('entrar_sala', ({ codigo, personagemId }) => {
      if (socket.data.vaga) return { ok: false, erro: 'ja-em-sala' };
      if (tentativaBloqueada()) return { ok: false, erro: 'muitas-tentativas' };
      const resultado = contarErro(gerenciador.entrarNaSala({ codigo, personagemId }, agora()));
      if (!resultado.ok) return resultado;
      vincular(socket, resultado.sala, resultado.jogador);
      enviarSala(resultado.sala);
      return { ok: true, codigo: resultado.sala.codigo, token: resultado.jogador.token };
    });

    ao('retomar', ({ codigo, token }) => {
      if (tentativaBloqueada()) return { ok: false, erro: 'muitas-tentativas' };
      const resultado = gerenciador.retomar({ codigo, token }, agora());
      if (!resultado.ok) {
        codigosErrados.registrar(endereco, agora());
        return resultado;
      }
      vincular(socket, resultado.sala, resultado.jogador);
      enviarSala(resultado.sala);
      return { ok: true };
    });

    ao('comecar', async () => {
      if (!socket.data.vaga) return { ok: false, erro: 'vaga-perdida' };
      const resultado = await gerenciador.comecar(socket.data.vaga, agora());
      if (!resultado.ok) return resultado;
      enviarSala(resultado.sala);
      return { ok: true };
    });

    ao('jogada', ({ pedido }) => {
      if (!socket.data.vaga) return { ok: false, erro: 'vaga-perdida' };
      const resultado = gerenciador.jogar({ ...socket.data.vaga, pedido }, agora());
      if (!resultado.ok) return resultado;
      enviarSala(resultado.sala);
      return { ok: true };
    });

    ao('sair', () => {
      const vaga = desvincular(socket);
      if (!vaga) return { ok: true };
      const sala = gerenciador.sair(vaga, agora());
      if (sala) enviarSala(sala);
      return { ok: true };
    });

    socket.on('disconnect', () => {
      const vaga = desvincular(socket);
      if (!vaga) return;
      const sala = gerenciador.marcarQueda(vaga, agora());
      if (sala) enviarSala(sala);
    });
  });

  const relogio = setInterval(() => {
    const instante = agora();
    const { mudaram, apagadas } = gerenciador.verificarPrazos(instante);
    mudaram.forEach(enviarSala);
    for (const sala of apagadas) {
      for (const jogador of sala.jogadores) {
        const socket = conexoes.get(jogador.token);
        if (socket) {
          socket.emit('sala_encerrada');
          desvincular(socket);
        }
      }
    }
    codigosErrados.limpar(instante);
    salasCriadas.limpar(instante);
  }, INTERVALO_DOS_PRAZOS_MS);
  relogio.unref();

  return {
    gerenciador,
    http,
    io,
    fechar: () =>
      new Promise((resolver) => {
        clearInterval(relogio);
        io.close(() => resolver());
      }),
  };
}

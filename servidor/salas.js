// Salas do modo online. Sem rede nem relógio próprio (o tempo vem de fora), para testar fácil.
// Tudo fica só na memória: quando a sala termina, nada sobra. Nenhum dado é gravado.
import { randomInt } from 'node:crypto';
import { PERSONAGENS } from '../src/data/personagens.js';
import { ACOES, FASES, MODOS, aplicarAcao, criarPartida, indiceDaFatia, podeGirar } from '../src/logica/jogo.js';
import { montarRodada } from '../src/logica/rodada.js';
import { codigoValido, gerarCodigo, gerarToken } from './codigo.js';
import {
  ESPERA_NA_VEZ_MS,
  MAX_JOGADORES,
  MAX_SALAS,
  MIN_JOGADORES,
  RESULTADO_VISIVEL_MS,
  SALA_PARADA_MS,
  VAGA_GUARDADA_MS,
} from './regrasOnline.js';

export const FASES_DA_SALA = { AGUARDANDO: 'aguardando', JOGANDO: 'jogando', FIM: 'fim' };
export const CONEXAO = { CONECTADA: 'conectada', RECONECTANDO: 'reconectando', SAIU: 'saiu' };
const NIVEIS = ['iniciante', 'intermediario', 'avancado'];
const ESCALA_DO_SORTEIO = 1_000_000;

function sortear() {
  return randomInt(ESCALA_DO_SORTEIO) / ESCALA_DO_SORTEIO;
}

const erro = (motivo) => ({ ok: false, erro: motivo });

export function criarGerenciador({ carregarPalavras, rng = sortear, limites = {} } = {}) {
  const salas = new Map();
  const limitesDaSala = { vagaMs: limites.vagaMs ?? VAGA_GUARDADA_MS, vezMs: limites.vezMs ?? ESPERA_NA_VEZ_MS };
  const maxSalas = limites.maxSalas ?? MAX_SALAS;

  function criarJogador(personagem, agora) {
    return { ...personagem, token: gerarToken(), conexao: CONEXAO.CONECTADA, quedaEm: null, entrouEm: agora };
  }

  function personagemLivre(sala, personagemId) {
    const personagem = PERSONAGENS.find((p) => p.id === personagemId);
    if (!personagem) return { motivo: 'personagem-invalido' };
    if (sala && sala.jogadores.some((j) => j.id === personagemId)) return { motivo: 'personagem-ocupado' };
    return { personagem };
  }

  function jogadorDoToken(sala, token) {
    return sala.jogadores.find((j) => j.token === token && j.conexao !== CONEXAO.SAIU);
  }

  function ativos(sala) {
    return sala.jogadores.filter((j) => j.conexao !== CONEXAO.SAIU);
  }

  function criarSala({ nivel, personagemId }, agora) {
    if (!NIVEIS.includes(nivel)) return erro('nivel-invalido');
    if (salas.size >= maxSalas) return erro('servidor-cheio');
    const { personagem, motivo } = personagemLivre(null, personagemId);
    if (motivo) return erro(motivo);
    let codigo;
    do codigo = gerarCodigo();
    while (salas.has(codigo));
    const jogador = criarJogador(personagem, agora);
    const sala = {
      codigo,
      nivel,
      fase: FASES_DA_SALA.AGUARDANDO,
      anfitriaoId: jogador.id,
      jogadores: [jogador],
      partida: null,
      giro: null,
      vezOfflineDesde: null,
      prontos: [],
      ultimaAtividade: agora,
      fimEm: null,
      limites: limitesDaSala,
    };
    salas.set(codigo, sala);
    return { ok: true, sala, jogador };
  }

  // Devolve só o necessário para escolher o personagem. Código inexistente é tentativa errada.
  function consultarSala(codigo) {
    const sala = codigoValido(codigo) ? salas.get(codigo) : null;
    if (!sala) return erro('sala-nao-encontrada');
    if (sala.fase !== FASES_DA_SALA.AGUARDANDO) return erro('partida-comecou');
    if (ativos(sala).length >= MAX_JOGADORES) return erro('sala-cheia');
    return { ok: true, nivel: sala.nivel, ocupados: ativos(sala).map((j) => j.id) };
  }

  function entrarNaSala({ codigo, personagemId }, agora) {
    const consulta = consultarSala(codigo);
    if (!consulta.ok) return consulta;
    const sala = salas.get(codigo);
    // Quem saiu do lobby libera o personagem.
    sala.jogadores = ativos(sala);
    const { personagem, motivo } = personagemLivre(sala, personagemId);
    if (motivo) return erro(motivo);
    const jogador = criarJogador(personagem, agora);
    sala.jogadores.push(jogador);
    sala.ultimaAtividade = agora;
    return { ok: true, sala, jogador };
  }

  function retomar({ codigo, token }, agora) {
    const sala = codigoValido(codigo) ? salas.get(codigo) : null;
    const jogador = sala && typeof token === 'string' ? jogadorDoToken(sala, token) : null;
    if (!jogador) return erro('vaga-perdida');
    jogador.conexao = CONEXAO.CONECTADA;
    jogador.quedaEm = null;
    atualizarEsperaDaVez(sala, agora);
    return { ok: true, sala, jogador };
  }

  function indiceNaPartida(sala, jogador) {
    return sala.partida.jogadores.findIndex((j) => j.id === jogador.id);
  }

  function atualizarEsperaDaVez(sala, agora) {
    const partida = sala.partida;
    const emJogo = sala.fase === FASES_DA_SALA.JOGANDO && partida && partida.fase === FASES.JOGANDO;
    const daVez = emJogo ? sala.jogadores.find((j) => j.id === partida.jogadores[partida.vez].id) : null;
    if (daVez && daVez.conexao === CONEXAO.RECONECTANDO) {
      if (sala.vezOfflineDesde === null) sala.vezOfflineDesde = agora;
    } else {
      sala.vezOfflineDesde = null;
    }
  }

  function marcarQueda({ codigo, token }, agora) {
    const sala = salas.get(codigo);
    const jogador = sala && jogadorDoToken(sala, token);
    if (!jogador) return null;
    jogador.conexao = CONEXAO.RECONECTANDO;
    jogador.quedaEm = agora;
    avancarSeTodosProntos(sala, agora);
    atualizarEsperaDaVez(sala, agora);
    return sala;
  }

  function registrarSaida(sala, jogador, agora) {
    jogador.conexao = CONEXAO.SAIU;
    jogador.quedaEm = null;
    if (sala.anfitriaoId === jogador.id) {
      const proximo = ativos(sala)[0];
      if (proximo) sala.anfitriaoId = proximo.id;
    }
    if (sala.fase === FASES_DA_SALA.AGUARDANDO) {
      sala.jogadores = ativos(sala);
    } else if (sala.partida) {
      sala.partida = aplicarAcao(sala.partida, { tipo: ACOES.MARCAR_SAIDA, indice: indiceNaPartida(sala, jogador) });
      sincronizarFim(sala, agora);
      avancarSeTodosProntos(sala, agora);
    }
    atualizarEsperaDaVez(sala, agora);
    if (ativos(sala).length === 0) salas.delete(sala.codigo);
  }

  function sair({ codigo, token }, agora) {
    const sala = salas.get(codigo);
    const jogador = sala && jogadorDoToken(sala, token);
    if (!jogador) return null;
    registrarSaida(sala, jogador, agora);
    return sala;
  }

  function sincronizarFim(sala, agora) {
    if (sala.partida && sala.partida.fase === FASES.FIM && sala.fase !== FASES_DA_SALA.FIM) {
      sala.fase = FASES_DA_SALA.FIM;
      sala.fimEm = agora;
    }
  }

  function avancarPainel(sala, agora) {
    sala.partida = aplicarAcao(sala.partida, { tipo: ACOES.PROXIMO_PAINEL });
    sala.prontos = [];
    sincronizarFim(sala, agora);
    atualizarEsperaDaVez(sala, agora);
  }

  // Todos precisam clicar para seguir, sem prazo. Só quem caiu ou saiu não segura as outras.
  function avancarSeTodosProntos(sala, agora) {
    if (!sala.partida || sala.partida.fase !== FASES.RESOLVIDO || sala.prontos.length === 0) return;
    const conectados = sala.jogadores.filter((j) => j.conexao === CONEXAO.CONECTADA);
    if (conectados.length === 0 || conectados.some((j) => !sala.prontos.includes(j.id))) return;
    avancarPainel(sala, agora);
  }

  async function comecar({ codigo, token }, agora) {
    const sala = salas.get(codigo);
    const jogador = sala && jogadorDoToken(sala, token);
    if (!jogador) return erro('vaga-perdida');
    if (sala.anfitriaoId !== jogador.id) return erro('so-anfitriao');
    if (sala.fase !== FASES_DA_SALA.AGUARDANDO) return erro('partida-comecou');
    if (ativos(sala).length < MIN_JOGADORES) return erro('faltam-jogadores');
    const temas = await carregarPalavras(sala.nivel);
    // Outra chamada pode ter começado a partida enquanto as palavras carregavam.
    if (sala.fase !== FASES_DA_SALA.AGUARDANDO) return erro('partida-comecou');
    const rodada = montarRodada(temas, sala.nivel, rng);
    const jogadores = ativos(sala).map((j) => ({ id: j.id, nome: j.nome, cor: j.cor }));
    sala.partida = criarPartida({ modo: MODOS.COMPETITIVO, nivel: sala.nivel, jogadores, rodada });
    sala.fase = FASES_DA_SALA.JOGANDO;
    sala.ultimaAtividade = agora;
    return { ok: true, sala };
  }

  // Monta a ação a partir do que o aparelho mandou, sem confiar em mais nada do pedido.
  function montarAcao(pedido, partida) {
    if (!pedido || typeof pedido !== 'object') return null;
    switch (pedido.tipo) {
      case ACOES.GIRAR:
        // O sorteio é sempre do servidor: o que vier do aparelho é ignorado.
        return { tipo: ACOES.GIRAR, sorteio: rng() };
      case ACOES.ESCOLHER_LETRA:
        return typeof pedido.letra === 'string' && /^[A-Z]$/.test(pedido.letra)
          ? { tipo: ACOES.ESCOLHER_LETRA, letra: pedido.letra }
          : null;
      case ACOES.RESOLVER:
        return typeof pedido.resposta === 'string' && pedido.resposta.length <= 60
          ? { tipo: ACOES.RESOLVER, resposta: pedido.resposta }
          : null;
      case ACOES.PROXIMO_PAINEL:
        return partida.fase === FASES.RESOLVIDO ? { tipo: ACOES.PROXIMO_PAINEL } : null;
      default:
        return null;
    }
  }

  function jogar({ codigo, token, pedido }, agora) {
    const sala = salas.get(codigo);
    const jogador = sala && jogadorDoToken(sala, token);
    if (!jogador) return erro('vaga-perdida');
    if (sala.fase !== FASES_DA_SALA.JOGANDO) return erro('fora-de-jogo');
    const partida = sala.partida;
    const acao = montarAcao(pedido, partida);
    if (!acao) return erro('jogada-invalida');

    if (acao.tipo === ACOES.PROXIMO_PAINEL) {
      if (!sala.prontos.includes(jogador.id)) sala.prontos.push(jogador.id);
      sala.ultimaAtividade = agora;
      avancarSeTodosProntos(sala, agora);
      return { ok: true, sala };
    }

    if (partida.jogadores[partida.vez].id !== jogador.id) return erro('nao-e-sua-vez');

    const girou = acao.tipo === ACOES.GIRAR && podeGirar(partida);
    const proxima = aplicarAcao(partida, acao);
    if (proxima === partida) return erro('jogada-invalida');
    sala.partida = proxima;
    // Todos os aparelhos animam a roleta para a mesma fatia.
    if (girou) sala.giro = { numero: (sala.giro ? sala.giro.numero : 0) + 1, fatia: indiceDaFatia(acao.sorteio) };
    sala.ultimaAtividade = agora;
    sincronizarFim(sala, agora);
    atualizarEsperaDaVez(sala, agora);
    return { ok: true, sala };
  }

  // Chamar periodicamente. Devolve as salas que mudaram, e as apagadas à parte.
  function verificarPrazos(agora) {
    const mudaram = new Set();
    const apagadas = [];
    for (const sala of salas.values()) {
      const terminou = sala.fase === FASES_DA_SALA.FIM && agora - sala.fimEm >= RESULTADO_VISIVEL_MS;
      if (terminou || agora - sala.ultimaAtividade >= SALA_PARADA_MS) {
        salas.delete(sala.codigo);
        apagadas.push(sala);
        continue;
      }
      for (const jogador of ativos(sala)) {
        if (jogador.quedaEm !== null && agora - jogador.quedaEm >= limitesDaSala.vagaMs) {
          registrarSaida(sala, jogador, agora);
          mudaram.add(sala);
        }
      }
      if (sala.vezOfflineDesde !== null && agora - sala.vezOfflineDesde >= limitesDaSala.vezMs) {
        sala.partida = aplicarAcao(sala.partida, { tipo: ACOES.PASSAR_VEZ });
        sala.vezOfflineDesde = null;
        atualizarEsperaDaVez(sala, agora);
        mudaram.add(sala);
      }
    }
    return { mudaram: [...mudaram].filter((s) => salas.has(s.codigo)), apagadas };
  }

  return {
    criarSala,
    consultarSala,
    entrarNaSala,
    retomar,
    marcarQueda,
    sair,
    comecar,
    jogar,
    verificarPrazos,
    obter: (codigo) => salas.get(codigo),
    total: () => salas.size,
  };
}

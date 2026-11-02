// Regras do jogo em JavaScript puro: proximoEstado = aplicarAcao(estado, acao).
// Sem React, window, document ou localStorage: será reutilizado no servidor.
import { contarCasasFechadas, contarOcorrencias } from './texto.js';

export const MODOS = { COMPETITIVO: 'competitivo', COOPERATIVO: 'cooperativo' };
export const FASES = { JOGANDO: 'jogando', RESOLVIDO: 'resolvido', FIM: 'fim' };
export const ACOES = {
  GIRAR: 'GIRAR',
  ESCOLHER_LETRA: 'ESCOLHER_LETRA',
  RESOLVER: 'RESOLVER',
  PROXIMO_PAINEL: 'PROXIMO_PAINEL',
};
export const JOGADAS = {
  LETRA_CERTA: 'letra-certa',
  LETRA_ERRADA: 'letra-errada',
  CHUTE_ERRADO: 'chute-errado',
};

export const FATIAS_ROLETA = [10, 25, 5, 30, 15, 50, 20, 40];
// Perto da média da roleta (24), mas sem o risco de errar a letra e perder a vez.
const PONTOS_POR_CASA_FECHADA = 20;

export function criarPartida({ modo, nivel, jogadores, rodada }) {
  return {
    modo,
    nivel,
    tema: rodada.tema,
    paineis: rodada.paineis,
    jogadores: jogadores.map((j) => ({ ...j, pontos: 0 })),
    estrelas: 0,
    indicePainel: 0,
    vez: 0,
    letrasUsadas: [],
    descartadas: [],
    erros: 0,
    valorRoleta: null,
    fase: FASES.JOGANDO,
    ultimaJogada: null,
    ganho: 0,
  };
}

export function painelAtual(estado) {
  return estado.paineis[estado.indicePainel];
}

export function multiplicadorAtual(estado) {
  return estado.indicePainel + 1;
}

export function calcularEstrelas(erros) {
  if (erros <= 2) return 3;
  return erros <= 4 ? 2 : 1;
}

export function indiceDaFatia(sorteio) {
  return Math.floor(sorteio * FATIAS_ROLETA.length);
}

function ehCompetitivo(estado) {
  return estado.modo === MODOS.COMPETITIVO;
}

export function podeGirar(estado) {
  return (
    ehCompetitivo(estado) &&
    estado.fase === FASES.JOGANDO &&
    estado.valorRoleta === null
  );
}

export function podeEscolherLetra(estado) {
  return (
    estado.fase === FASES.JOGANDO &&
    (!ehCompetitivo(estado) || estado.valorRoleta !== null)
  );
}

function proximoJogador(estado) {
  return (estado.vez + 1) % estado.jogadores.length;
}

function somarPontos(estado, pontos) {
  return estado.jogadores.map((j, i) =>
    i === estado.vez ? { ...j, pontos: j.pontos + pontos } : j,
  );
}

function fecharPainel(estado, ganhoCompetitivo) {
  const ganho = ehCompetitivo(estado)
    ? ganhoCompetitivo
    : calcularEstrelas(estado.erros);
  return {
    ...estado,
    fase: FASES.RESOLVIDO,
    ganho,
    valorRoleta: null,
    estrelas: ehCompetitivo(estado) ? estado.estrelas : estado.estrelas + ganho,
    jogadores: ehCompetitivo(estado) ? somarPontos(estado, ganho) : estado.jogadores,
  };
}

function girar(estado, sorteio) {
  if (!podeGirar(estado)) return estado;
  return {
    ...estado,
    valorRoleta: FATIAS_ROLETA[indiceDaFatia(sorteio)],
    ultimaJogada: null,
  };
}

function escolherLetra(estado, letra) {
  const painel = painelAtual(estado);
  if (
    !podeEscolherLetra(estado) ||
    !painel.letras.includes(letra) ||
    estado.letrasUsadas.includes(letra)
  ) {
    return estado;
  }

  const letrasUsadas = [...estado.letrasUsadas, letra];
  const quantidade = contarOcorrencias(painel.texto, letra);

  if (quantidade === 0) {
    return {
      ...estado,
      letrasUsadas,
      erros: estado.erros + 1,
      valorRoleta: null,
      vez: proximoJogador(estado),
      ultimaJogada: { tipo: JOGADAS.LETRA_ERRADA, letra },
    };
  }

  const pontos = ehCompetitivo(estado)
    ? estado.valorRoleta * quantidade * multiplicadorAtual(estado)
    : 0;
  const ultimaJogada = { tipo: JOGADAS.LETRA_CERTA, letra, quantidade, pontos };

  if (contarCasasFechadas(painel.texto, letrasUsadas) === 0) {
    return fecharPainel({ ...estado, letrasUsadas, ultimaJogada }, pontos);
  }
  return {
    ...estado,
    letrasUsadas,
    valorRoleta: null,
    ultimaJogada,
    // No competitivo quem acerta continua; no cooperativo todos revezam.
    vez: ehCompetitivo(estado) ? estado.vez : proximoJogador(estado),
    jogadores: somarPontos(estado, pontos),
  };
}

function resolver(estado, opcao) {
  const painel = painelAtual(estado);
  if (
    estado.fase !== FASES.JOGANDO ||
    !painel.opcoes.includes(opcao) ||
    estado.descartadas.includes(opcao)
  ) {
    return estado;
  }
  if (opcao === painel.texto) {
    const fechadas = contarCasasFechadas(painel.texto, estado.letrasUsadas);
    const bonus = PONTOS_POR_CASA_FECHADA * fechadas * multiplicadorAtual(estado);
    return fecharPainel({ ...estado, ultimaJogada: null }, bonus);
  }
  return {
    ...estado,
    descartadas: [...estado.descartadas, opcao],
    erros: estado.erros + 1,
    valorRoleta: null,
    vez: proximoJogador(estado),
    ultimaJogada: { tipo: JOGADAS.CHUTE_ERRADO, opcao },
  };
}

function avancarPainel(estado) {
  if (estado.fase !== FASES.RESOLVIDO) return estado;
  if (estado.indicePainel === estado.paineis.length - 1) {
    return { ...estado, fase: FASES.FIM };
  }
  return {
    ...estado,
    indicePainel: estado.indicePainel + 1,
    vez: proximoJogador(estado),
    letrasUsadas: [],
    descartadas: [],
    erros: 0,
    valorRoleta: null,
    fase: FASES.JOGANDO,
    ultimaJogada: null,
    ganho: 0,
  };
}

// Ações inválidas devolvem o mesmo estado, sem lançar erro.
export function aplicarAcao(estado, acao) {
  switch (acao.tipo) {
    case ACOES.GIRAR:
      return girar(estado, acao.sorteio);
    case ACOES.ESCOLHER_LETRA:
      return escolherLetra(estado, acao.letra);
    case ACOES.RESOLVER:
      return resolver(estado, acao.opcao);
    case ACOES.PROXIMO_PAINEL:
      return avancarPainel(estado);
    default:
      return estado;
  }
}

export function calcularResultado(estado) {
  if (estado.modo === MODOS.COOPERATIVO) {
    return { estrelas: estado.estrelas, maximo: estado.paineis.length * 3 };
  }
  const ranking = [...estado.jogadores].sort((a, b) => b.pontos - a.pontos);
  const maior = ranking[0].pontos;
  return { ranking, vencedores: ranking.filter((j) => j.pontos === maior) };
}

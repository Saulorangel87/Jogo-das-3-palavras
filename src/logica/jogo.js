// Regras do jogo em JavaScript puro: proximoEstado = aplicarAcao(estado, acao).
// Sem React, window, document ou localStorage: será reutilizado no servidor.

export const MODOS = { COMPETITIVO: 'competitivo', COOPERATIVO: 'cooperativo' };
export const FASES = { JOGANDO: 'jogando', RESOLVIDA: 'resolvida', FIM: 'fim' };
export const ACOES = {
  REVELAR: 'REVELAR',
  ARRISCAR: 'ARRISCAR',
  PROXIMA_PALAVRA: 'PROXIMA_PALAVRA',
};

const VALORES = [10, 20, 30];
const DESCONTO_POR_PENALIDADE = 30;
const PERCENTUAL_MINIMO = 30;

export function criarPartida({ modo, jogadores, rodada }) {
  return {
    modo,
    tema: rodada.tema,
    palavras: rodada.palavras,
    jogadores: jogadores.map((j) => ({ ...j, pontos: 0 })),
    estrelas: 0,
    indicePalavra: 0,
    vez: 0,
    revelados: 0,
    descartadas: [],
    revelouNestaVez: false,
    fase: FASES.JOGANDO,
    ultimoErro: null,
    ganho: 0,
  };
}

export function calcularPontos(indicePalavra, penalidades) {
  const percentual = Math.max(
    PERCENTUAL_MINIMO,
    100 - DESCONTO_POR_PENALIDADE * penalidades,
  );
  return Math.round((VALORES[indicePalavra] * percentual) / 100);
}

export function calcularEstrelas(penalidades) {
  if (penalidades === 0) return 3;
  return penalidades === 1 ? 2 : 1;
}

export function palavraAtual(estado) {
  return estado.palavras[estado.indicePalavra];
}

// Quanto a palavra vale agora: pontos no competitivo, estrelas no cooperativo.
export function valorAtual(estado) {
  const penalidades = estado.revelados + estado.descartadas.length;
  return estado.modo === MODOS.COMPETITIVO
    ? calcularPontos(estado.indicePalavra, penalidades)
    : calcularEstrelas(penalidades);
}

export function podeRevelar(estado) {
  return (
    estado.fase === FASES.JOGANDO &&
    !estado.revelouNestaVez &&
    estado.revelados < palavraAtual(estado).silabas.length
  );
}

function podeArriscar(estado, opcao) {
  return (
    estado.fase === FASES.JOGANDO &&
    palavraAtual(estado).opcoes.includes(opcao) &&
    !estado.descartadas.includes(opcao)
  );
}

function proximoJogador(estado) {
  return (estado.vez + 1) % estado.jogadores.length;
}

function resolverPalavra(estado) {
  const ganho = valorAtual(estado);
  const competitivo = estado.modo === MODOS.COMPETITIVO;
  return {
    ...estado,
    fase: FASES.RESOLVIDA,
    ganho,
    ultimoErro: null,
    estrelas: competitivo ? estado.estrelas : estado.estrelas + ganho,
    jogadores: competitivo
      ? estado.jogadores.map((j, i) =>
          i === estado.vez ? { ...j, pontos: j.pontos + ganho } : j,
        )
      : estado.jogadores,
  };
}

function registrarErro(estado, opcao) {
  return {
    ...estado,
    descartadas: [...estado.descartadas, opcao],
    vez: proximoJogador(estado),
    revelouNestaVez: false,
    ultimoErro: opcao,
  };
}

function avancarPalavra(estado) {
  if (estado.indicePalavra === estado.palavras.length - 1) {
    return { ...estado, fase: FASES.FIM };
  }
  return {
    ...estado,
    indicePalavra: estado.indicePalavra + 1,
    vez: proximoJogador(estado),
    revelados: 0,
    descartadas: [],
    revelouNestaVez: false,
    fase: FASES.JOGANDO,
    ultimoErro: null,
    ganho: 0,
  };
}

// Ações inválidas devolvem o mesmo estado, sem lançar erro.
export function aplicarAcao(estado, acao) {
  switch (acao.tipo) {
    case ACOES.REVELAR:
      if (!podeRevelar(estado)) return estado;
      return {
        ...estado,
        revelados: estado.revelados + 1,
        revelouNestaVez: true,
        ultimoErro: null,
      };
    case ACOES.ARRISCAR:
      if (!podeArriscar(estado, acao.opcao)) return estado;
      return acao.opcao === palavraAtual(estado).palavra
        ? resolverPalavra(estado)
        : registrarErro(estado, acao.opcao);
    case ACOES.PROXIMA_PALAVRA:
      return estado.fase === FASES.RESOLVIDA ? avancarPalavra(estado) : estado;
    default:
      return estado;
  }
}

export function calcularResultado(estado) {
  if (estado.modo === MODOS.COOPERATIVO) {
    return { estrelas: estado.estrelas, maximo: estado.palavras.length * 3 };
  }
  const ranking = [...estado.jogadores].sort((a, b) => b.pontos - a.pontos);
  const maior = ranking[0].pontos;
  return { ranking, vencedores: ranking.filter((j) => j.pontos === maior) };
}

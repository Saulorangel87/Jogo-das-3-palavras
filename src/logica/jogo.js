// Regras do jogo em JavaScript puro: proximoEstado = aplicarAcao(estado, acao).
// Sem React, window, document ou localStorage: será reutilizado no servidor.
import {
  contarCasasFechadas,
  contarOcorrencias,
  letrasDoTexto,
  mesmaResposta,
} from './texto.js';
import {
  ESTRELAS_MAXIMAS_POR_PAINEL,
  ESTRELAS_MINIMAS,
  ESTRELAS_POR_ERROS,
  FATIAS_ROLETA,
  MULTIPLICADORES_DOS_PAINEIS,
  PONTOS_POR_CASA_FECHADA,
  TEMPO_DA_VEZ_S,
} from './regras.js';

export { FATIAS_ROLETA, TEMPO_DA_VEZ_S };

export const MODOS = { COMPETITIVO: 'competitivo', COOPERATIVO: 'cooperativo' };
export const FASES = { JOGANDO: 'jogando', RESOLVIDO: 'resolvido', FIM: 'fim' };
export const ACOES = {
  GIRAR: 'GIRAR',
  ESCOLHER_LETRA: 'ESCOLHER_LETRA',
  RESOLVER: 'RESOLVER',
  PROXIMO_PAINEL: 'PROXIMO_PAINEL',
  // Só no online: o servidor decide quando alguém caiu ou saiu da partida.
  PASSAR_VEZ: 'PASSAR_VEZ',
  MARCAR_SAIDA: 'MARCAR_SAIDA',
  // O relógio da vez acabou: quem controla o tempo (aparelho local ou servidor) pede esta ação.
  TEMPO_ESGOTADO: 'TEMPO_ESGOTADO',
};
export const JOGADAS = {
  LETRA_CERTA: 'letra-certa',
  LETRA_ERRADA: 'letra-errada',
  CHUTE_ERRADO: 'chute-errado',
  TEMPO_ESGOTADO: 'tempo-esgotado',
};

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
    // Sobe a cada ação que muda o jogo, menos o giro. Quem controla o relógio da vez reinicia a contagem quando ele muda.
    turno: 0,
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
  const ultimo = MULTIPLICADORES_DOS_PAINEIS.length - 1;
  return MULTIPLICADORES_DOS_PAINEIS[Math.min(estado.indicePainel, ultimo)];
}

export function calcularEstrelas(erros) {
  const faixa = ESTRELAS_POR_ERROS.find((f) => erros <= f.ateErros);
  return faixa ? faixa.estrelas : ESTRELAS_MINIMAS;
}

// Onde cada fatia começa e termina, de 0 a 1 (a roleta desenha com isto, e o sorteio cai nestes trechos).
export function limitesDasFatias() {
  const total = FATIAS_ROLETA.reduce((soma, f) => soma + (f.peso ?? 1), 0);
  let inicio = 0;
  return FATIAS_ROLETA.map((f) => {
    const fim = inicio + (f.peso ?? 1) / total;
    const limites = { inicio, fim };
    inicio = fim;
    return limites;
  });
}

const LIMITES_DAS_FATIAS = limitesDasFatias();

export function indiceDaFatia(sorteio) {
  const indice = LIMITES_DAS_FATIAS.findIndex((l) => sorteio >= l.inicio && sorteio < l.fim);
  return indice === -1 ? LIMITES_DAS_FATIAS.length - 1 : indice;
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

// Pula quem saiu da partida (online). No jogo local ninguém sai.
function proximoJogador(estado) {
  const total = estado.jogadores.length;
  for (let passo = 1; passo < total; passo++) {
    const candidato = (estado.vez + passo) % total;
    if (!estado.jogadores[candidato].saiu) return candidato;
  }
  return estado.vez;
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
    valorRoleta: FATIAS_ROLETA[indiceDaFatia(sorteio)].valor,
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
      ultimaJogada: { tipo: JOGADAS.LETRA_ERRADA, letra, quem: estado.vez },
    };
  }

  const pontos = ehCompetitivo(estado)
    ? estado.valorRoleta * quantidade * multiplicadorAtual(estado)
    : 0;
  const ultimaJogada = {
    tipo: JOGADAS.LETRA_CERTA,
    letra,
    quantidade,
    pontos,
    quem: estado.vez,
  };

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

function respostaValida(painel, estado, resposta) {
  if (painel.opcoes) {
    return painel.opcoes.includes(resposta) && !estado.descartadas.includes(resposta);
  }
  return letrasDoTexto(resposta).length === letrasDoTexto(painel.texto).length;
}

function resolver(estado, resposta) {
  const painel = painelAtual(estado);
  if (estado.fase !== FASES.JOGANDO || !respostaValida(painel, estado, resposta)) {
    return estado;
  }
  if (mesmaResposta(resposta, painel.texto)) {
    const fechadas = contarCasasFechadas(painel.texto, estado.letrasUsadas);
    const bonus = PONTOS_POR_CASA_FECHADA * fechadas * multiplicadorAtual(estado);
    return fecharPainel({ ...estado, ultimaJogada: null }, bonus);
  }
  return {
    ...estado,
    descartadas: painel.opcoes ? [...estado.descartadas, resposta] : estado.descartadas,
    erros: estado.erros + 1,
    valorRoleta: null,
    vez: proximoJogador(estado),
    ultimaJogada: { tipo: JOGADAS.CHUTE_ERRADO, resposta, quem: estado.vez },
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

// Passa a vez sem punição: não conta erro nem tira pontos.
function passarVez(estado) {
  if (estado.fase !== FASES.JOGANDO) return estado;
  return { ...estado, valorRoleta: null, ultimaJogada: null, vez: proximoJogador(estado) };
}

// Acabou o tempo da vez: passa para a próxima pessoa, sem erro e sem perder pontos.
function tempoEsgotado(estado) {
  if (estado.fase !== FASES.JOGANDO || !ehCompetitivo(estado)) return estado;
  const quem = estado.vez;
  return { ...passarVez(estado), ultimaJogada: { tipo: JOGADAS.TEMPO_ESGOTADO, quem } };
}

// O relógio da vez só roda no competitivo, enquanto o painel está aberto.
export function temRelogio(estado) {
  return ehCompetitivo(estado) && estado.fase === FASES.JOGANDO;
}

// Quem saiu fica no placar, mas não joga mais. Sobrando uma pessoa só, a partida termina.
function marcarSaida(estado, indice) {
  const jogador = estado.jogadores[indice];
  if (!jogador || jogador.saiu || estado.fase === FASES.FIM) return estado;
  const jogadores = estado.jogadores.map((j, i) => (i === indice ? { ...j, saiu: true } : j));
  const proximo = { ...estado, jogadores };
  if (jogadores.filter((j) => !j.saiu).length <= 1) return { ...proximo, fase: FASES.FIM, encerradaPorSaida: true };
  return indice === estado.vez ? passarVez(proximo) : proximo;
}

// Ações inválidas devolvem o mesmo estado, sem lançar erro.
// Toda ação que muda o jogo, menos o giro, sobe o `turno`: o relógio da vez recomeça.
export function aplicarAcao(estado, acao) {
  const proximo = aplicarAcaoSemTurno(estado, acao);
  if (proximo === estado || acao.tipo === ACOES.GIRAR) return proximo;
  return { ...proximo, turno: estado.turno + 1 };
}

function aplicarAcaoSemTurno(estado, acao) {
  switch (acao.tipo) {
    case ACOES.GIRAR:
      return girar(estado, acao.sorteio);
    case ACOES.ESCOLHER_LETRA:
      return escolherLetra(estado, acao.letra);
    case ACOES.RESOLVER:
      return resolver(estado, acao.resposta);
    case ACOES.PROXIMO_PAINEL:
      return avancarPainel(estado);
    case ACOES.PASSAR_VEZ:
      return passarVez(estado);
    case ACOES.MARCAR_SAIDA:
      return marcarSaida(estado, acao.indice);
    case ACOES.TEMPO_ESGOTADO:
      return tempoEsgotado(estado);
    default:
      return estado;
  }
}

export function calcularResultado(estado) {
  if (estado.modo === MODOS.COOPERATIVO) {
    return { estrelas: estado.estrelas, maximo: estado.paineis.length * ESTRELAS_MAXIMAS_POR_PAINEL };
  }
  // Quem saiu fica no placar, mas vence quem ficou até o fim.
  const ficaram = estado.jogadores.filter((j) => !j.saiu);
  const candidatos = ficaram.length > 0 ? ficaram : estado.jogadores;
  const porPontos = (a, b) => b.pontos - a.pontos;
  const ranking = [...candidatos].sort(porPontos).concat(
    estado.jogadores.filter((j) => !candidatos.includes(j)).sort(porPontos),
  );
  const maior = ranking[0].pontos;
  return { ranking, vencedores: candidatos.filter((j) => j.pontos === maior) };
}

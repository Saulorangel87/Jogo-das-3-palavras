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
  MULTIPLICADOR_DO_BONUS,
  PONTOS_POR_CASA_FECHADA,
  TEMPO_DA_VEZ_S,
  TIPOS_DE_FATIA,
  VALOR_DA_LETRA_GRATIS,
} from './regras.js';

export { FATIAS_ROLETA, TEMPO_DA_VEZ_S, TIPOS_DE_FATIA };

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
  // Resultados da roleta que não são pontos (o aparelho conta o que aconteceu na tela).
  BONUS: 'bonus',
  GIRO_EXTRA: 'giro-extra',
  ESCUDO: 'escudo',
  SONECA: 'soneca',
};
// Jogadas boas para quem as fez (carinha comemorando, mensagem em verde).
export const JOGADAS_BOAS = new Set([JOGADAS.LETRA_CERTA, JOGADAS.BONUS, JOGADAS.GIRO_EXTRA, JOGADAS.ESCUDO]);

export function criarPartida({ modo, nivel, jogadores, rodada }) {
  return {
    modo,
    nivel,
    tema: rodada.tema,
    paineis: rodada.paineis,
    // `bonus` e `escudo` são os poderes guardados da roleta (só no competitivo).
    jogadores: jogadores.map((j) => ({ ...j, pontos: 0, bonus: false, escudo: false })),
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

// Muda só os campos de um jogador, sem mexer nos outros.
function mudarJogador(estado, indice, mudancas) {
  return estado.jogadores.map((j, i) => (i === indice ? { ...j, ...mudancas } : j));
}

function giroExtra(estado) {
  return { ...estado, ultimaJogada: { tipo: JOGADAS.GIRO_EXTRA, quem: estado.vez } };
}

// Letra grátis: abre uma letra aleatória e paga por ela, sem risco de errar. Se só sobrasse uma letra
// fechada ela fecharia o painel de graça, então nesse caso vira giro extra.
function letraGratis(estado, sorteioLetra) {
  const painel = painelAtual(estado);
  const fechadas = [...new Set(letrasDoTexto(painel.texto))]
    .filter((l) => !estado.letrasUsadas.includes(l))
    .sort();
  if (fechadas.length < 2) return giroExtra(estado);
  const letra = fechadas[Math.min(fechadas.length - 1, Math.floor(sorteioLetra * fechadas.length))];
  const quantidade = contarOcorrencias(painel.texto, letra);
  const comBonus = estado.jogadores[estado.vez].bonus;
  const pontos =
    VALOR_DA_LETRA_GRATIS * quantidade * multiplicadorAtual(estado) * (comBonus ? MULTIPLICADOR_DO_BONUS : 1);
  const base = comBonus ? { ...estado, jogadores: mudarJogador(estado, estado.vez, { bonus: false }) } : estado;
  return {
    ...base,
    letrasUsadas: [...estado.letrasUsadas, letra],
    jogadores: somarPontos(base, pontos),
    ultimaJogada: {
      tipo: JOGADAS.LETRA_CERTA,
      letra,
      quantidade,
      pontos,
      quem: estado.vez,
      gratis: true,
      ...(comBonus ? { bonus: true } : {}),
    },
  };
}

// O sorteio decide a fatia; `sorteioLetra` só serve à letra grátis. Os dois vêm de fora.
function girar(estado, sorteio, sorteioLetra = 0) {
  if (!podeGirar(estado)) return estado;
  const fatia = FATIAS_ROLETA[indiceDaFatia(sorteio)];
  const base = { ...estado, valorRoleta: null, ultimaJogada: null };
  const jogador = estado.jogadores[estado.vez];
  switch (fatia.tipo) {
    case TIPOS_DE_FATIA.PONTOS:
      return { ...base, valorRoleta: fatia.valor };
    case TIPOS_DE_FATIA.BONUS:
      if (jogador.bonus) return giroExtra(base);
      return {
        ...base,
        jogadores: mudarJogador(estado, estado.vez, { bonus: true }),
        ultimaJogada: { tipo: JOGADAS.BONUS, quem: estado.vez },
      };
    case TIPOS_DE_FATIA.ESCUDO:
      if (jogador.escudo) return giroExtra(base);
      return {
        ...base,
        jogadores: mudarJogador(estado, estado.vez, { escudo: true }),
        ultimaJogada: { tipo: JOGADAS.ESCUDO, quem: estado.vez },
      };
    case TIPOS_DE_FATIA.LETRA_GRATIS:
      return letraGratis(base, sorteioLetra);
    case TIPOS_DE_FATIA.SONECA:
      return {
        ...base,
        vez: proximoJogador(estado),
        ultimaJogada: { tipo: JOGADAS.SONECA, quem: estado.vez },
      };
    default:
      return giroExtra(base);
  }
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

  const jogador = estado.jogadores[estado.vez];

  if (quantidade === 0) {
    // O escudo gasta-se aqui: a letra errada não passa a vez, e a pessoa gira de novo.
    const protegida = ehCompetitivo(estado) && jogador.escudo;
    return {
      ...estado,
      letrasUsadas,
      erros: estado.erros + 1,
      valorRoleta: null,
      jogadores: protegida ? mudarJogador(estado, estado.vez, { escudo: false }) : estado.jogadores,
      vez: protegida ? estado.vez : proximoJogador(estado),
      ultimaJogada: {
        tipo: JOGADAS.LETRA_ERRADA,
        letra,
        quem: estado.vez,
        ...(protegida ? { protegida: true } : {}),
      },
    };
  }

  // O bônus dobra só esta letra certa e se gasta.
  const comBonus = ehCompetitivo(estado) && jogador.bonus;
  const base = comBonus ? { ...estado, jogadores: mudarJogador(estado, estado.vez, { bonus: false }) } : estado;
  const pontos = ehCompetitivo(estado)
    ? estado.valorRoleta * quantidade * multiplicadorAtual(estado) * (comBonus ? MULTIPLICADOR_DO_BONUS : 1)
    : 0;
  const ultimaJogada = {
    tipo: JOGADAS.LETRA_CERTA,
    letra,
    quantidade,
    pontos,
    quem: estado.vez,
    ...(comBonus ? { bonus: true } : {}),
  };

  if (contarCasasFechadas(painel.texto, letrasUsadas) === 0) {
    return fecharPainel({ ...base, letrasUsadas, ultimaJogada }, pontos);
  }
  return {
    ...base,
    letrasUsadas,
    valorRoleta: null,
    ultimaJogada,
    // No competitivo quem acerta continua; no cooperativo todos revezam.
    vez: ehCompetitivo(estado) ? estado.vez : proximoJogador(estado),
    jogadores: somarPontos(base, pontos),
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
// Toda ação que muda o jogo sobe o `turno` e o relógio da vez recomeça, menos o giro que não passa a vez.
export function aplicarAcao(estado, acao) {
  const proximo = aplicarAcaoSemTurno(estado, acao);
  if (proximo === estado) return proximo;
  // Girar só reinicia o relógio se a vez passou (soneca) ou o painel fechou.
  if (acao.tipo === ACOES.GIRAR && proximo.vez === estado.vez && proximo.fase === estado.fase) return proximo;
  return { ...proximo, turno: estado.turno + 1 };
}

function aplicarAcaoSemTurno(estado, acao) {
  switch (acao.tipo) {
    case ACOES.GIRAR:
      return girar(estado, acao.sorteio, acao.sorteioLetra);
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

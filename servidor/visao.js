// O que cada aparelho pode saber. O servidor guarda as respostas; aqui elas são escondidas.
import { FASES, JOGADAS } from '../src/logica/jogo.js';
import { normalizarLetra } from '../src/logica/texto.js';

export const CASA_FECHADA = '_';

function esconderTexto(texto, letrasUsadas) {
  return texto
    .split('')
    .map((l) => (l === ' ' || letrasUsadas.includes(normalizarLetra(l)) ? l : CASA_FECHADA))
    .join('');
}

// Resposta errada digitada casa a casa seria um canal de texto livre entre as crianças.
// Só a opção escrita do iniciante é repetida, porque ela já está na tela de todos.
function jogadaSegura(jogada, painel) {
  if (!jogada || jogada.tipo !== JOGADAS.CHUTE_ERRADO || painel.opcoes) return jogada;
  return { ...jogada, resposta: null };
}

export function visaoDaPartida(estado) {
  const aberta = estado.fase !== FASES.JOGANDO;
  const atual = estado.paineis[estado.indicePainel];
  return {
    ...estado,
    ultimaJogada: jogadaSegura(estado.ultimaJogada, atual),
    // Os outros painéis ficam vazios: só o tamanho da lista importa para a tela.
    paineis: estado.paineis.map((painel, i) => {
      if (i !== estado.indicePainel) return {};
      return { ...painel, texto: aberta ? painel.texto : esconderTexto(painel.texto, estado.letrasUsadas) };
    }),
  };
}

// `agora` serve para a tela mostrar a contagem de quem caiu na própria vez.
export function visaoDaSala(sala, voceId, agora) {
  return {
    codigo: sala.codigo,
    nivel: sala.nivel,
    fase: sala.fase,
    anfitriaoId: sala.anfitriaoId,
    voceId,
    jogadores: sala.jogadores.map((j) => ({
      id: j.id,
      nome: j.nome,
      cor: j.cor,
      conexao: j.conexao,
      vagaAteMs: j.quedaEm ? Math.max(0, j.quedaEm + sala.limites.vagaMs - agora) : null,
    })),
    esperaNaVezMs:
      sala.vezOfflineDesde === null ? null : Math.max(0, sala.vezOfflineDesde + sala.limites.vezMs - agora),
    giro: sala.giro,
    prontos: sala.prontos,
    esperaProximoMs:
      sala.prontosDesde === null ? null : Math.max(0, sala.prontosDesde + sala.limites.proximoMs - agora),
    partida: sala.partida ? visaoDaPartida(sala.partida) : null,
  };
}

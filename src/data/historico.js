import { HISTORICO_VAZIO } from '../logica/rodada.js';

// O que já foi jogado em cada nível, para as partidas não repetirem palavras.
// localStorage pode falhar (modo privado, TV): sem ele, o jogo só deixa de lembrar.
const CHAVE = '3palavras:historico';

function lerTudo() {
  try {
    const texto = localStorage.getItem(CHAVE);
    if (texto) {
      const salvo = JSON.parse(texto);
      if (salvo && typeof salvo === 'object') return salvo;
    }
  } catch {
    // Sem histórico salvo: começa do zero.
  }
  return {};
}

export function lerHistorico(nivel) {
  const h = lerTudo()[nivel];
  if (!h || !Array.isArray(h.jogadas)) return HISTORICO_VAZIO;
  return {
    jogadas: h.jogadas.filter((t) => typeof t === 'string'),
    ultimoTema: typeof h.ultimoTema === 'string' ? h.ultimoTema : null,
  };
}

export function salvarHistorico(nivel, historico) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify({ ...lerTudo(), [nivel]: historico }));
  } catch {
    // Sem armazenamento: a lembrança vale só até recarregar a página.
  }
}

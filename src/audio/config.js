// Preferências de som. localStorage pode falhar (modo privado, TV), então tudo tem try/catch.
const CHAVE = '3palavras:som';
export const PADRAO = { mudo: false, efeitos: 0.8, musica: 0.6 };

function nivel(valor, padrao) {
  return typeof valor === 'number' && valor >= 0 && valor <= 1 ? valor : padrao;
}

export function lerConfig() {
  try {
    const texto = localStorage.getItem(CHAVE);
    if (texto) {
      const salvo = JSON.parse(texto);
      return {
        mudo: Boolean(salvo.mudo),
        efeitos: nivel(salvo.efeitos, PADRAO.efeitos),
        musica: nivel(salvo.musica, PADRAO.musica),
      };
    }
  } catch {
    // Sem preferências salvas: usa o padrão.
  }
  return { ...PADRAO };
}

export function salvarConfig(config) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(config));
  } catch {
    // Sem armazenamento: a escolha vale só nesta sessão.
  }
}

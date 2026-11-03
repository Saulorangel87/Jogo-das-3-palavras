// Um arquivo JSON por nível, carregado só quando o nível é pedido
// (o banco tem milhares de itens e a TV antiga não precisa de todos de uma vez).
const ARQUIVOS = {
  iniciante: () => import('./iniciante.json'),
  intermediario: () => import('./intermediario.json'),
  avancado: () => import('./avancado.json'),
};

const cache = {};

// Único ponto de acesso às palavras. É assíncrono porque no futuro buscará da API.
export async function carregarPalavras(nivel) {
  const abrir = ARQUIVOS[nivel];
  if (!abrir) throw new Error(`Nível desconhecido: ${nivel}`);
  if (!cache[nivel]) {
    const modulo = await abrir();
    cache[nivel] = modulo.default || modulo;
  }
  return cache[nivel];
}

import banco from './palavras.json';

// Único ponto de acesso às palavras. É assíncrono porque no futuro buscará da API.
export async function carregarPalavras(nivel) {
  const temas = banco[nivel];
  if (!temas) throw new Error(`Nível desconhecido: ${nivel}`);
  return temas;
}

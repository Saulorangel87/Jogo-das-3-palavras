import { readFile } from 'node:fs/promises';
import { criarAplicacao } from './aplicacao.js';

const PORTA = Number(process.env.PORTA || 3000);
const ORIGENS = (process.env.ORIGENS || 'https://3palavras.devsaulo.com.br').split(',');
const ARQUIVOS = new Set(['iniciante', 'intermediario', 'avancado']);
const cache = new Map();

async function carregarPalavras(nivel) {
  if (!ARQUIVOS.has(nivel)) throw new Error('nível desconhecido');
  if (!cache.has(nivel)) {
    const url = new URL(`../src/data/${nivel}.json`, import.meta.url);
    cache.set(nivel, JSON.parse(await readFile(url, 'utf-8')));
  }
  return cache.get(nivel);
}

const { http } = criarAplicacao({ carregarPalavras, origens: ORIGENS });
http.listen(PORTA, () => {
  console.log(`Servidor do 3 Palavras na porta ${PORTA}`);
});

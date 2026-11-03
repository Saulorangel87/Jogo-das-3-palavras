// Plugin do Vite, sem dependência externa: gera dist/sw.js com a lista de
// arquivos do build, para o jogo inteiro (os 3 níveis) funcionar sem internet.
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const MODELO = fileURLToPath(new URL('./sw-modelo.js', import.meta.url));
const FORA_DO_CACHE = new Set(['/sw.js']);

export function listarArquivos(pasta, raiz = pasta) {
  return readdirSync(pasta).flatMap((nome) => {
    const caminho = join(pasta, nome);
    if (statSync(caminho).isDirectory()) return listarArquivos(caminho, raiz);
    return [`/${relative(raiz, caminho).split(sep).join('/')}`];
  });
}

// A versão muda sempre que o conteúdo de algum arquivo muda.
export function calcularVersao(arquivos, lerArquivo) {
  const hash = createHash('sha256');
  for (const arquivo of arquivos) {
    hash.update(arquivo);
    hash.update(lerArquivo(arquivo));
  }
  return hash.digest('hex').slice(0, 12);
}

export function montarServiceWorker(modelo, arquivos, versao) {
  return modelo
    .replace('__VERSAO__', () => versao)
    .replace('__ARQUIVOS__', () => JSON.stringify(arquivos));
}

export function arquivosParaGuardar(arquivos) {
  return arquivos.filter((arquivo) => !FORA_DO_CACHE.has(arquivo)).sort();
}

export default function pluginServiceWorker() {
  let saida;
  return {
    name: '3palavras-service-worker',
    apply: 'build',
    enforce: 'post',
    configResolved(config) {
      saida = join(config.root, config.build.outDir);
    },
    closeBundle: {
      order: 'post',
      handler() {
        const arquivos = arquivosParaGuardar(listarArquivos(saida));
        const versao = calcularVersao(arquivos, (a) => readFileSync(join(saida, a)));
        const modelo = readFileSync(MODELO, 'utf-8');
        writeFileSync(join(saida, 'sw.js'), montarServiceWorker(modelo, arquivos, versao));
      },
    },
  };
}

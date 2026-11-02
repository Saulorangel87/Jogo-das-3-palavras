// Sorteio da partida. Puro: o gerador de aleatórios pode ser injetado nos testes.
import { letrasDoTexto } from './texto.js';

const ALFABETO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
// Letras extras do iniciante: evita K, W, Y e outras raras para quem está aprendendo.
const LETRAS_COMUNS = 'ABCDEFGILMNOPRSTUV'.split('');
const EXTRAS_INICIANTE = 4;
const TOTAL_PAINEIS = 3;
const ERRADAS_POR_PAINEL = 2;

function embaralhar(lista, rng) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function semelhanca(candidato, alvo) {
  const mesmaLetra = candidato.texto[0] === alvo.texto[0] ? 2 : 0;
  const mesmoTamanho = candidato.texto.length === alvo.texto.length ? 1 : 0;
  const mesmoTema = candidato.tema === alvo.tema ? 1 : 0;
  return mesmaLetra + mesmoTamanho + mesmoTema;
}

// Opções erradas vêm de fora da partida, para um painel não entregar outro.
function escolherErradas(alvo, candidatos, rng) {
  return embaralhar(candidatos, rng)
    .sort((a, b) => semelhanca(b, alvo) - semelhanca(a, alvo))
    .slice(0, ERRADAS_POR_PAINEL)
    .map((c) => c.texto);
}

function montarTeclado(texto, nivel, rng) {
  if (nivel !== 'iniciante') return ALFABETO;
  const certas = Array.from(new Set(letrasDoTexto(texto)));
  const extras = embaralhar(
    LETRAS_COMUNS.filter((l) => !certas.includes(l)),
    rng,
  ).slice(0, EXTRAS_INICIANTE);
  return [...certas, ...extras].sort();
}

export function montarRodada(temas, nivel, rng = Math.random) {
  const tema = temas[Math.floor(rng() * temas.length)];
  const sorteados = embaralhar(tema.itens, rng).slice(0, TOTAL_PAINEIS);
  const naPartida = new Set(sorteados.map((i) => i.texto));
  const candidatos = temas
    .flatMap((t) => t.itens.map((i) => ({ ...i, tema: t.tema })))
    .filter((i) => !naPartida.has(i.texto));

  return {
    tema: tema.tema,
    paineis: sorteados.map((item) => ({
      ...item,
      letras: montarTeclado(item.texto, nivel, rng),
      opcoes: embaralhar(
        [item.texto, ...escolherErradas({ ...item, tema: tema.tema }, candidatos, rng)],
        rng,
      ),
    })),
  };
}

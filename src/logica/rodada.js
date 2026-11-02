// Sorteio da rodada. Puro: o gerador de aleatórios pode ser injetado nos testes.

function embaralhar(lista, rng) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function semelhanca(candidata, alvo) {
  const mesmaSilaba = candidata.silabas[0] === alvo.silabas[0] ? 2 : 0;
  const mesmoTamanho = candidata.palavra.length === alvo.palavra.length ? 1 : 0;
  return mesmaSilaba + mesmoTamanho;
}

// Opções erradas vêm de fora do trio, para uma palavra não entregar outra da mesma rodada.
function escolherErradas(alvo, candidatas, rng, quantidade) {
  return embaralhar(candidatas, rng)
    .sort((a, b) => semelhanca(b, alvo) - semelhanca(a, alvo))
    .slice(0, quantidade)
    .map((c) => c.palavra);
}

export function montarRodada(temas, rng = Math.random) {
  const tema = temas[Math.floor(rng() * temas.length)];
  const trio = embaralhar(tema.palavras, rng).slice(0, 3);
  const noTrio = new Set(trio.map((p) => p.palavra));
  const candidatas = temas
    .flatMap((t) => t.palavras)
    .filter((p) => !noTrio.has(p.palavra));

  return {
    tema: tema.tema,
    palavras: trio.map((p) => ({
      ...p,
      opcoes: embaralhar([p.palavra, ...escolherErradas(p, candidatas, rng, 2)], rng),
    })),
  };
}

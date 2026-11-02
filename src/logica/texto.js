// Comparação de letras: acentos e cedilha contam como a letra base.

export function normalizarLetra(letra) {
  return letra
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase();
}

export function letrasDoTexto(texto) {
  return texto.replace(/ /g, '').split('').map(normalizarLetra);
}

export function contarOcorrencias(texto, letra) {
  return letrasDoTexto(texto).filter((l) => l === letra).length;
}

export function contarCasasFechadas(texto, letrasUsadas) {
  return letrasDoTexto(texto).filter((l) => !letrasUsadas.includes(l)).length;
}

export function mesmaResposta(a, b) {
  return letrasDoTexto(a).join('') === letrasDoTexto(b).join('');
}

// Monta a resposta: letras abertas ficam como estão, e as digitadas ocupam as casas fechadas.
export function montarResposta(texto, letrasUsadas, digitadas) {
  let proxima = 0;
  return texto
    .split('')
    .map((letra) => {
      if (letra === ' ' || letrasUsadas.includes(normalizarLetra(letra))) return letra;
      const digitada = digitadas[proxima];
      proxima += 1;
      return digitada;
    })
    .join('');
}

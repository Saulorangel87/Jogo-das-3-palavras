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

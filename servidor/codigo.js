import { randomBytes, randomInt } from 'node:crypto';

// Só consoantes: sem vogal não dá para formar palavra ofensiva por acaso.
// Sem letras fáceis de confundir ao ditar ou ler.
const LETRAS = 'BCDFGHJKLMNPRSTVZ';
const FORMATO = /^[BCDFGHJKLMNPRSTVZ]{4}-\d{2}$/;

// Cerca de 8 milhões de códigos: com o limite de tentativas, não dá para adivinhar.
export function gerarCodigo() {
  let letras = '';
  for (let i = 0; i < 4; i++) letras += LETRAS[randomInt(LETRAS.length)];
  return `${letras}-${String(randomInt(100)).padStart(2, '0')}`;
}

export function codigoValido(codigo) {
  return typeof codigo === 'string' && FORMATO.test(codigo);
}

// O token é o que permite voltar para a mesma vaga. Nunca é enviado aos outros jogadores.
export function gerarToken() {
  return randomBytes(24).toString('hex');
}

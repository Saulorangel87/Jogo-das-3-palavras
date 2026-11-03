// Um tema curto e original para cada personagem, tocado no timbre do seu instrumento.
// notas: [nota MIDI, duração em tempos]. `null` é pausa. Na bateria: 36 bumbo, 38 caixa, 42 chimbal, 49 prato.
import { tocarNota } from './instrumentos.js';

export const TEMPO = 0.3;

export const JINGLES = {
  lala: {
    instrumento: 'xilofone',
    notas: [[72, 0.5], [76, 0.5], [79, 0.5], [84, 0.5], [79, 0.25], [84, 1]],
  },
  boris: {
    instrumento: 'tuba',
    notas: [[48, 0.75], [55, 0.5], [52, 0.5], [48, 1]],
  },
  til: {
    instrumento: 'sanfona',
    notas: [[67, 1], [69, 0.5], [71, 0.5], [74, 1], [71, 0.5], [67, 1]],
  },
  cedilha: {
    instrumento: 'clarinete',
    notas: [[76, 0.25], [79, 0.25], [76, 0.25], [72, 0.25], [74, 0.5], [72, 1]],
  },
  tito: {
    instrumento: 'fagote',
    notas: [[55, 0.5], [59, 0.5], [62, 0.5], [59, 0.5], [55, 1]],
  },
  virgula: {
    // A pausa no meio é a vírgula.
    instrumento: 'piano',
    notas: [[64, 0.5], [67, 0.5], [72, 1], [null, 0.5], [67, 0.5], [64, 1.5]],
  },
  zuca: {
    instrumento: 'bateria',
    notas: [[36, 0.5], [42, 0.25], [38, 0.5], [42, 0.25], [36, 0.25], [36, 0.25], [38, 0.5], [49, 1]],
  },
  sapo: {
    instrumento: 'kazoo',
    notas: [[67, 0.25], [67, 0.25], [72, 0.5], [71, 0.25], [69, 0.25], [67, 0.5], [72, 1]],
  },
};

export function duracaoDoJingle(jingle) {
  return jingle.notas.reduce((total, [, tempos]) => total + tempos * TEMPO, 0);
}

export function agendarJingle(ctx, destino, jingle, quando, vol = 0.3) {
  let instante = quando;
  jingle.notas.forEach(([nota, tempos]) => {
    const dur = tempos * TEMPO;
    if (nota !== null) tocarNota(ctx, destino, jingle.instrumento, nota, instante, dur * 0.9, vol);
    instante += dur;
  });
  return duracaoDoJingle(jingle);
}

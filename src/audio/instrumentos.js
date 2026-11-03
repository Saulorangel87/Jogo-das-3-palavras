// Timbres dos instrumentos dos personagens, feitos só com osciladores e filtros.
import { bip, frequencia, rajada, voz } from './sintese.js';

const SOPROS = {
  xilofone: (f) => ({
    parciais: [['sine', 1, 1], ['sine', 3.9, 0.35]],
    percussivo: true,
    ataque: 0.004,
    dur: 0.1,
    soltura: 0.45,
    freq: f,
  }),
  tuba: (f) => ({
    parciais: [['sawtooth', 1, 1], ['square', 0.5, 0.4]],
    filtro: { tipo: 'lowpass', freq: 520 },
    ataque: 0.05,
    soltura: 0.12,
    freq: f,
  }),
  sanfona: (f) => ({
    parciais: [['square', 1, 0.5, -7], ['square', 1, 0.5, 7]],
    filtro: { tipo: 'lowpass', freq: 1900 },
    vibrato: { hz: 5.5, prof: 0.004 },
    ataque: 0.04,
    freq: f,
  }),
  clarinete: (f) => ({
    parciais: [['square', 1, 0.6]],
    filtro: { tipo: 'lowpass', freq: 1500, q: 2 },
    vibrato: { hz: 5, prof: 0.006 },
    ataque: 0.03,
    freq: f,
  }),
  fagote: (f) => ({
    parciais: [['sawtooth', 1, 0.7], ['sine', 2, 0.3]],
    filtro: { tipo: 'lowpass', freq: 800 },
    vibrato: { hz: 4.5, prof: 0.004 },
    ataque: 0.05,
    freq: f,
  }),
  piano: (f) => ({
    parciais: [['triangle', 1, 1], ['sine', 2, 0.4], ['sine', 3, 0.15]],
    percussivo: true,
    ataque: 0.005,
    dur: 0.15,
    soltura: 0.6,
    freq: f,
  }),
  // Timbres só da música de fundo: macios, para acompanhar a leitura sem cansar.
  kalimba: (f) => ({
    parciais: [['sine', 1, 1], ['sine', 2, 0.2], ['sine', 5.4, 0.07]],
    percussivo: true,
    ataque: 0.003,
    dur: 0.1,
    soltura: 0.5,
    freq: f,
  }),
  baixoRedondo: (f) => ({
    parciais: [['sine', 1, 1], ['triangle', 2, 0.25]],
    filtro: { tipo: 'lowpass', freq: 500 },
    percussivo: true,
    ataque: 0.01,
    dur: 0.12,
    soltura: 0.22,
    freq: f,
  }),
  harpa: (f) => ({
    parciais: [['triangle', 1, 1], ['sine', 2, 0.3]],
    percussivo: true,
    ataque: 0.004,
    dur: 0.08,
    soltura: 0.4,
    freq: f,
  }),
  colchao: (f) => ({
    parciais: [['triangle', 1, 0.5, -6], ['triangle', 1, 0.5, 6]],
    filtro: { tipo: 'lowpass', freq: 1000 },
    ataque: 0.3,
    soltura: 0.5,
    freq: f,
  }),
  kazoo: (f) => ({
    parciais: [['sawtooth', 1, 1]],
    filtro: { tipo: 'bandpass', freq: 1600, q: 2.5 },
    vibrato: { hz: 6, prof: 0.012 },
    ataque: 0.02,
    freq: f,
  }),
};

// Bateria: o número da "nota" escolhe a peça. 36 bumbo, 38 caixa, 42 chimbal, 49 prato.
function bateria(ctx, destino, midi, quando, vol) {
  if (midi <= 37) {
    bip(ctx, destino, { tipo: 'sine', freq: 160, ate: 45, quando, dur: 0.22, vol: vol * 1.2 });
  } else if (midi <= 41) {
    rajada(ctx, destino, { quando, dur: 0.16, vol: vol * 0.7, filtro: { tipo: 'bandpass', freq: 1800, q: 0.8 } });
    bip(ctx, destino, { tipo: 'triangle', freq: 190, ate: 150, quando, dur: 0.1, vol: vol * 0.5 });
  } else if (midi <= 45) {
    rajada(ctx, destino, { quando, dur: 0.05, vol: vol * 0.4, filtro: { tipo: 'highpass', freq: 7000 } });
  } else {
    rajada(ctx, destino, { quando, dur: 0.7, vol: vol * 0.5, filtro: { tipo: 'highpass', freq: 4500 } });
  }
}

export const INSTRUMENTOS = [...Object.keys(SOPROS), 'bateria'];

export function tocarNota(ctx, destino, instrumento, midi, quando, dur, vol) {
  if (instrumento === 'bateria') {
    bateria(ctx, destino, midi, quando, vol);
    return;
  }
  const projeto = SOPROS[instrumento](frequencia(midi));
  voz(ctx, destino, { ...projeto, quando, vol, dur: projeto.percussivo ? projeto.dur : dur });
}

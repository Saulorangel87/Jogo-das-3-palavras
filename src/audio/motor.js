// Motor de áudio: um único AudioContext, criado só depois do primeiro toque do jogador
// (os navegadores bloqueiam som antes disso).
import { lerConfig, salvarConfig } from './config.js';
import { agendarJingle, JINGLES } from './jingles.js';
import { EFEITOS } from './sons.js';
import { criarCadeia } from './sintese.js';

let contexto = null;
let cadeia = null;
let config = lerConfig();

function criarContexto() {
  const Classe = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
  if (!Classe) return null;
  try {
    return new Classe();
  } catch {
    return null;
  }
}

function aplicarConfig() {
  if (!cadeia) return;
  cadeia.mestre.gain.value = config.mudo ? 0 : 1;
  cadeia.efeitos.gain.value = config.efeitos;
  cadeia.musica.gain.value = config.musica;
}

// Chamar dentro de um gesto do jogador (clique, toque ou tecla). Devolve false se não houver áudio.
export function iniciarAudio() {
  if (!contexto) {
    contexto = criarContexto();
    if (!contexto) return false;
    cadeia = criarCadeia(contexto);
    aplicarConfig();
  }
  if (contexto.state === 'suspended' && contexto.resume) contexto.resume();
  return true;
}

export function estadoDoAudio() {
  return contexto ? contexto.state : 'inativo';
}

export function estaMudo() {
  return config.mudo;
}

export function definirMudo(mudo) {
  config = { ...config, mudo };
  salvarConfig(config);
  aplicarConfig();
}

const PASSO_DO_VOLUME = 10;

// O volume é um número de 0 a 1, sempre em passos de 10%.
export function volumeAtual() {
  return config.efeitos;
}

export function ajustarVolume(delta) {
  const passos = Math.round(config.efeitos * PASSO_DO_VOLUME) + Math.round(delta * PASSO_DO_VOLUME);
  const limitado = Math.min(PASSO_DO_VOLUME, Math.max(0, passos));
  config = { ...config, efeitos: limitado / PASSO_DO_VOLUME };
  salvarConfig(config);
  aplicarConfig();
  return config.efeitos;
}

export function tocarEfeito(nome, opcoes = {}, atraso = 0) {
  const efeito = EFEITOS[nome];
  if (!contexto || config.mudo || !efeito) return 0;
  return efeito(contexto, cadeia.efeitos, contexto.currentTime + atraso + 0.01, opcoes);
}

export function tocarJingle(personagemId, atraso = 0) {
  const jingle = JINGLES[personagemId];
  if (!contexto || config.mudo || !jingle) return 0;
  return agendarJingle(contexto, cadeia.efeitos, jingle, contexto.currentTime + atraso + 0.01);
}

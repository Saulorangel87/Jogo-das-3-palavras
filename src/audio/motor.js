// Motor de áudio: um único AudioContext, criado só depois do primeiro toque do jogador
// (os navegadores bloqueiam som antes disso).
import { lerConfig, salvarConfig } from './config.js';
import { tocarNota } from './instrumentos.js';
import { agendarJingle, JINGLES } from './jingles.js';
import { criarAgendador, FAIXAS } from './musica.js';
import { EFEITOS } from './sons.js';
import { criarCadeia } from './sintese.js';

let contexto = null;
let cadeia = null;
let config = lerConfig();
// Música: a faixa que a tela pediu e a que está tocando agora. A pedida pode chegar antes do
// primeiro toque do jogador; ela só começa quando o áudio é liberado.
let faixaPedida = null;
let trilha = null;

function criarContexto() {
  const Classe = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
  if (!Classe) return null;
  try {
    return new Classe();
  } catch {
    return null;
  }
}

// Com o volume no máximo, a música fica na metade da força dos efeitos: ela acompanha a
// leitura e nunca cobre o som de acerto. (Medido: as trilhas têm a mesma força dos efeitos.)
const MIXAGEM_DA_MUSICA = 0.5;

function aplicarConfig() {
  if (!cadeia) return;
  cadeia.mestre.gain.value = config.mudo ? 0 : 1;
  cadeia.efeitos.gain.value = config.efeitos;
  cadeia.musica.gain.value = config.musica * MIXAGEM_DA_MUSICA;
}

// Chamar a cada gesto do jogador (clique, toque ou tecla). Devolve false se não houver áudio.
// Nem todo gesto libera o som: em TV, uma seta do controle pode não contar para o navegador.
// Por isso se tenta de novo a cada gesto até o áudio rodar. Um gesto também prova que a tela
// está visível, então aqui não se consulta document.hidden, que pode mentir em TV.
export function iniciarAudio() {
  if (!contexto) {
    contexto = criarContexto();
    if (!contexto) return false;
    cadeia = criarCadeia(contexto);
    aplicarConfig();
    vigiarAba();
    sincronizarMusica();
  }
  if (contexto.state !== 'running' && contexto.resume) {
    const retomada = contexto.resume();
    if (retomada && retomada.catch) retomada.catch(() => {});
  }
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

// Os volumes são números de 0 a 1, sempre em passos de 10%. `efeitos` e `musica` são independentes.
function ajustarCanal(canal, delta) {
  const passos = Math.round(config[canal] * PASSO_DO_VOLUME) + Math.round(delta * PASSO_DO_VOLUME);
  const limitado = Math.min(PASSO_DO_VOLUME, Math.max(0, passos));
  config = { ...config, [canal]: limitado / PASSO_DO_VOLUME };
  salvarConfig(config);
  aplicarConfig();
  return config[canal];
}

export function volumeAtual() {
  return config.efeitos;
}

export function ajustarVolume(delta) {
  return ajustarCanal('efeitos', delta);
}

export function volumeDaMusica() {
  return config.musica;
}

export function ajustarVolumeDaMusica(delta) {
  return ajustarCanal('musica', delta);
}

// Sem som em aba escondida: a música não deve tocar para ninguém.
function abaEscondida() {
  return typeof document !== 'undefined' && document.hidden === true;
}

function vigiarAba() {
  if (typeof document === 'undefined') return;
  document.addEventListener('visibilitychange', () => {
    if (!contexto) return;
    if (abaEscondida()) {
      if (contexto.suspend) contexto.suspend();
    } else if (contexto.resume) {
      contexto.resume();
    }
  });
}

const ANTECEDENCIA_DA_MUSICA = 0.6; // segundos de notas agendadas à frente
const INTERVALO_DO_RELOGIO = 80; // ms entre uma checagem e outra
const ENTRADA_DA_MUSICA = 1; // segundos de fade-in
const SAIDA_DA_MUSICA = 0.6; // segundos de fade-out
const NIVEL_ABAFADO = 0.15; // volume da música enquanto o painel comemora
const TEMPO_DE_ABAFAR = 0.35; // segundos para abafar ou voltar

// O que o jogo diz à música: quanto do painel já abriu e qual é o painel.
let andamento = { progresso: 0, painel: 0 };
let abafada = false;
let abafador = null;
let filtroDaMusica = null;

// Todas as trilhas passam por um abafador (comemoração) e um filtro que tira o chiado agudo.
function prepararBarramentoDaMusica() {
  if (abafador) return;
  filtroDaMusica = contexto.createBiquadFilter();
  filtroDaMusica.type = 'lowpass';
  filtroDaMusica.frequency.value = 4200;
  filtroDaMusica.connect(cadeia.musica);
  abafador = contexto.createGain();
  abafador.gain.value = abafada ? NIVEL_ABAFADO : 1;
  abafador.connect(filtroDaMusica);
}

function pararTrilha() {
  if (!trilha) return;
  const { ganho, relogio } = trilha;
  trilha = null;
  clearInterval(relogio);
  const agora = contexto.currentTime;
  ganho.gain.cancelScheduledValues(agora);
  ganho.gain.setValueAtTime(ganho.gain.value, agora);
  ganho.gain.linearRampToValueAtTime(0, agora + SAIDA_DA_MUSICA);
  setTimeout(() => ganho.disconnect(), (SAIDA_DA_MUSICA + ANTECEDENCIA_DA_MUSICA + 1) * 1000);
}

function iniciarTrilha(nome) {
  prepararBarramentoDaMusica();
  const faixa = FAIXAS[nome];
  const agora = contexto.currentTime;
  const ganho = contexto.createGain();
  ganho.gain.setValueAtTime(0, agora);
  ganho.gain.linearRampToValueAtTime(1, agora + ENTRADA_DA_MUSICA);
  ganho.connect(abafador);
  const agendador = criarAgendador(faixa);
  agendador.iniciar(agora + 0.1);
  const atual = { nome, ganho, relogio: null, agendador };

  // O relógio do navegador é impreciso, mas as notas já agendadas no relógio do áudio saem
  // no tempo certo. A antecedência curta deixa o andamento reagir logo ao jogo.
  function agendar() {
    agendador.avancar(contexto.currentTime + ANTECEDENCIA_DA_MUSICA, () => andamento, (instrumento, midi, quando, dur, vol) => {
      tocarNota(contexto, ganho, instrumento, midi, quando, dur, vol);
    });
  }
  agendar();
  atual.relogio = setInterval(agendar, INTERVALO_DO_RELOGIO);
  trilha = atual;
}

function sincronizarMusica() {
  if (!contexto) return;
  if (trilha && trilha.nome === faixaPedida) return;
  pararTrilha();
  if (faixaPedida && FAIXAS[faixaPedida]) iniciarTrilha(faixaPedida);
}

// A tela diz qual faixa quer (ou null para silêncio). Pedir a que já toca não reinicia nada.
export function pedirMusica(nome) {
  faixaPedida = nome || null;
  sincronizarMusica();
}

// O jogo avisa como está o painel; a música acelera e ganha camadas sozinha.
export function definirAndamentoDaMusica(progresso, painel) {
  andamento = { progresso, painel };
}

// Enquanto o painel comemora, a música abaixa para os sons de festa aparecerem.
export function abafarMusica(abafar) {
  abafada = abafar;
  if (!abafador) return;
  const agora = contexto.currentTime;
  abafador.gain.cancelScheduledValues(agora);
  abafador.gain.setValueAtTime(abafador.gain.value, agora);
  abafador.gain.linearRampToValueAtTime(abafar ? NIVEL_ABAFADO : 1, agora + TEMPO_DE_ABAFAR);
}

// Andamento atual da música, em batidas por minuto (null se não há música tocando).
export function andamentoDaMusica() {
  return trilha ? Math.round(trilha.agendador.estado.bpm * 10) / 10 : null;
}

export function musicaTocando() {
  return trilha ? trilha.nome : null;
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

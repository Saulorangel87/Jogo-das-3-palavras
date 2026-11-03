// Ferramentas de síntese sobre a Web Audio API, sem bibliotecas.
// Tudo recebe (ctx, destino, ...): serve para o áudio ao vivo e para o OfflineAudioContext dos testes.

const SILENCIO = 0.0001;

export function frequencia(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// Barramentos: efeitos e música têm volume próprio, e o compressor evita estouro quando os sons se somam.
export function criarCadeia(ctx) {
  const compressor = ctx.createDynamicsCompressor();
  compressor.connect(ctx.destination);
  const mestre = ctx.createGain();
  mestre.connect(compressor);
  const efeitos = ctx.createGain();
  efeitos.connect(mestre);
  const musica = ctx.createGain();
  musica.connect(mestre);
  return { mestre, efeitos, musica };
}

export function ruido(ctx, duracao) {
  const tamanho = Math.max(1, Math.floor(ctx.sampleRate * duracao));
  const buffer = ctx.createBuffer(1, tamanho, ctx.sampleRate);
  const dados = buffer.getChannelData(0);
  for (let i = 0; i < tamanho; i++) dados[i] = Math.random() * 2 - 1;
  const fonte = ctx.createBufferSource();
  fonte.buffer = buffer;
  return fonte;
}

// Envelope simples: sobe rápido e depois sustenta (sopros) ou decai direto (percussão e teclas).
function envelope(ctx, quando, ataque, dur, soltura, vol, percussivo) {
  const ganho = ctx.createGain();
  const fim = quando + dur + soltura;
  ganho.gain.setValueAtTime(SILENCIO, quando);
  ganho.gain.linearRampToValueAtTime(vol, quando + ataque);
  if (!percussivo) ganho.gain.setValueAtTime(vol, Math.max(quando + ataque, quando + dur));
  ganho.gain.exponentialRampToValueAtTime(SILENCIO, fim);
  return { ganho, fim };
}

// Uma voz de instrumento: soma de osciladores (parciais), filtro opcional e vibrato opcional.
// parciais: [tipo, múltiplo da frequência, ganho, desafinação em cents]
export function voz(ctx, destino, o) {
  const ataque = o.ataque === undefined ? 0.01 : o.ataque;
  const soltura = o.soltura === undefined ? 0.08 : o.soltura;
  const { ganho, fim } = envelope(ctx, o.quando, ataque, o.dur, soltura, o.vol, o.percussivo);
  let entrada = ganho;
  ganho.connect(destino);

  if (o.filtro) {
    const filtro = ctx.createBiquadFilter();
    filtro.type = o.filtro.tipo;
    filtro.frequency.value = o.filtro.freq;
    filtro.Q.value = o.filtro.q || 1;
    filtro.connect(ganho);
    entrada = filtro;
  }

  let lfo = null;
  let profundidade = null;
  if (o.vibrato) {
    lfo = ctx.createOscillator();
    lfo.frequency.value = o.vibrato.hz;
    profundidade = ctx.createGain();
    profundidade.gain.value = o.freq * o.vibrato.prof;
    lfo.connect(profundidade);
    lfo.start(o.quando);
    lfo.stop(fim + 0.02);
  }

  o.parciais.forEach(([tipo, multiplo, nivel, cents]) => {
    const osc = ctx.createOscillator();
    osc.type = tipo;
    osc.frequency.value = o.freq * multiplo;
    if (cents) osc.detune.value = cents;
    if (nivel === 1) {
      osc.connect(entrada);
    } else {
      const parcial = ctx.createGain();
      parcial.gain.value = nivel;
      osc.connect(parcial);
      parcial.connect(entrada);
    }
    if (profundidade) profundidade.connect(osc.frequency);
    osc.start(o.quando);
    osc.stop(fim + 0.02);
  });
}

// Rajada de ruído filtrado: base de caixa, chimbal e prato.
export function rajada(ctx, destino, { quando, dur, vol, filtro }) {
  const fonte = ruido(ctx, dur + 0.05);
  const f = ctx.createBiquadFilter();
  f.type = filtro.tipo;
  f.frequency.value = filtro.freq;
  f.Q.value = filtro.q || 1;
  const ganho = ctx.createGain();
  ganho.gain.setValueAtTime(vol, quando);
  ganho.gain.exponentialRampToValueAtTime(SILENCIO, quando + dur);
  fonte.connect(f);
  f.connect(ganho);
  ganho.connect(destino);
  fonte.start(quando);
  fonte.stop(quando + dur + 0.05);
}

// Tom simples, com glissando opcional (`ate`).
export function bip(ctx, destino, o) {
  const osc = ctx.createOscillator();
  osc.type = o.tipo || 'sine';
  osc.frequency.setValueAtTime(o.freq, o.quando);
  if (o.ate) osc.frequency.exponentialRampToValueAtTime(o.ate, o.quando + o.dur);
  const ganho = ctx.createGain();
  ganho.gain.setValueAtTime(SILENCIO, o.quando);
  ganho.gain.linearRampToValueAtTime(o.vol, o.quando + 0.008);
  ganho.gain.exponentialRampToValueAtTime(SILENCIO, o.quando + o.dur);
  osc.connect(ganho);
  ganho.connect(destino);
  osc.start(o.quando);
  osc.stop(o.quando + o.dur + 0.02);
}

export { SILENCIO };

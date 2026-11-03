import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

function no() {
  return {
    connect() {},
    disconnect() {},
    gain: { value: 1, setValueAtTime() {}, linearRampToValueAtTime() {}, cancelScheduledValues() {} },
  };
}

function contextoFalso(liberaNaTentativa) {
  return class {
    constructor() {
      this.state = 'suspended';
      this.currentTime = 0;
      this.destination = {};
      this.tentativas = 0;
      contextos.push(this);
    }
    createDynamicsCompressor() {
      return no();
    }
    createGain() {
      return no();
    }
    resume() {
      this.tentativas += 1;
      if (this.tentativas >= liberaNaTentativa) this.state = 'running';
      return Promise.resolve();
    }
  };
}

let contextos;

async function motorCom(liberaNaTentativa, hidden = false) {
  contextos = [];
  vi.resetModules();
  vi.stubGlobal('window', { AudioContext: contextoFalso(liberaNaTentativa) });
  vi.stubGlobal('document', { hidden, addEventListener() {} });
  return import('./motor.js');
}

describe('liberação do áudio', () => {
  beforeEach(() => {
    contextos = [];
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('um gesto que não libera (seta na TV) não trava o som: o seguinte tenta de novo', async () => {
    const { iniciarAudio, estadoDoAudio } = await motorCom(2);
    iniciarAudio();
    expect(estadoDoAudio()).toBe('suspended');
    iniciarAudio();
    expect(estadoDoAudio()).toBe('running');
    expect(contextos).toHaveLength(1);
  });

  it('libera mesmo se a TV disser que a página está escondida', async () => {
    const { iniciarAudio, estadoDoAudio } = await motorCom(1, true);
    iniciarAudio();
    expect(estadoDoAudio()).toBe('running');
  });

  it('depois de rodando, novos gestos não fazem nada', async () => {
    const { iniciarAudio } = await motorCom(1);
    iniciarAudio();
    iniciarAudio();
    iniciarAudio();
    expect(contextos[0].tentativas).toBe(1);
  });
});

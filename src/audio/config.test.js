import { afterEach, describe, expect, it } from 'vitest';
import { PADRAO, lerConfig, salvarConfig } from './config.js';

function falsoStorage(inicial) {
  const dados = { ...inicial };
  return {
    getItem: (k) => (k in dados ? dados[k] : null),
    setItem: (k, v) => {
      dados[k] = String(v);
    },
    dados,
  };
}

afterEach(() => {
  delete globalThis.localStorage;
});

describe('config de som', () => {
  it('sem localStorage usa o padrão e não quebra ao salvar', () => {
    expect(lerConfig()).toEqual(PADRAO);
    expect(() => salvarConfig(PADRAO)).not.toThrow();
  });

  it('guarda e lê as preferências', () => {
    globalThis.localStorage = falsoStorage({});
    salvarConfig({ mudo: true, efeitos: 0.5, musica: 0.2 });
    expect(lerConfig()).toEqual({ mudo: true, efeitos: 0.5, musica: 0.2 });
  });

  it('ignora lixo salvo', () => {
    globalThis.localStorage = falsoStorage({ '3palavras:som': '{"efeitos": 7, "musica": "alto"}' });
    expect(lerConfig()).toEqual(PADRAO);
    globalThis.localStorage = falsoStorage({ '3palavras:som': 'não é json' });
    expect(lerConfig()).toEqual(PADRAO);
  });
});

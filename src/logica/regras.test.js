import { describe, expect, it } from 'vitest';
import {
  ESTRELAS_MAXIMAS_POR_PAINEL,
  ESTRELAS_MINIMAS,
  ESTRELAS_POR_ERROS,
  FATIAS_ROLETA,
  MULTIPLICADORES_DOS_PAINEIS,
  TIPOS_DE_FATIA,
} from './regras.js';
import { calcularEstrelas } from './jogo.js';

describe('regras ajustáveis', () => {
  it('a roleta só tem fatias positivas (ninguém perde pontos)', () => {
    expect(FATIAS_ROLETA.length).toBeGreaterThanOrEqual(2);
    for (const fatia of FATIAS_ROLETA) {
      if (fatia.tipo === TIPOS_DE_FATIA.PONTOS) expect(fatia.valor).toBeGreaterThan(0);
      expect(fatia.peso ?? 1).toBeGreaterThan(0);
    }
  });

  it('a primeira e a última fatia valem pontos (os testes e o sorteio contam com isso)', () => {
    expect(FATIAS_ROLETA[0].tipo).toBe(TIPOS_DE_FATIA.PONTOS);
    expect(FATIAS_ROLETA[FATIAS_ROLETA.length - 1].tipo).toBe(TIPOS_DE_FATIA.PONTOS);
  });

  it('há um multiplicador por painel e eles não diminuem', () => {
    expect(MULTIPLICADORES_DOS_PAINEIS).toHaveLength(3);
    for (let i = 1; i < 3; i++) {
      expect(MULTIPLICADORES_DOS_PAINEIS[i]).toBeGreaterThanOrEqual(MULTIPLICADORES_DOS_PAINEIS[i - 1]);
    }
  });

  it('as faixas de estrelas vão do melhor ao pior e ficam entre o mínimo e o máximo', () => {
    let anterior = { ateErros: -1, estrelas: ESTRELAS_MAXIMAS_POR_PAINEL + 1 };
    for (const faixa of ESTRELAS_POR_ERROS) {
      expect(faixa.ateErros).toBeGreaterThan(anterior.ateErros);
      expect(faixa.estrelas).toBeLessThan(anterior.estrelas);
      expect(faixa.estrelas).toBeGreaterThan(ESTRELAS_MINIMAS - 1);
      anterior = faixa;
    }
    expect(calcularEstrelas(0)).toBe(ESTRELAS_MAXIMAS_POR_PAINEL);
    expect(calcularEstrelas(999)).toBe(ESTRELAS_MINIMAS);
  });
});

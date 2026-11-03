import { describe, expect, it } from 'vitest';
import { ajustarVolume, definirMudo, estaMudo, tocarEfeito, tocarJingle, volumeAtual } from './motor.js';

// Em Node não há AudioContext: o motor tem de continuar funcionando, só sem som.
describe('motor sem áudio disponível', () => {
  it('não toca nada e não quebra', () => {
    expect(tocarEfeito('letraCerta')).toBe(0);
    expect(tocarJingle('lala')).toBe(0);
  });

  it('o volume sobe e desce em passos de 10%', () => {
    const inicial = volumeAtual();
    expect(ajustarVolume(-0.1)).toBeCloseTo(inicial - 0.1, 10);
    expect(ajustarVolume(0.1)).toBeCloseTo(inicial, 10);
  });

  it('o volume nunca sai de 0 a 1', () => {
    for (let i = 0; i < 15; i++) ajustarVolume(0.1);
    expect(volumeAtual()).toBe(1);
    for (let i = 0; i < 15; i++) ajustarVolume(-0.1);
    expect(volumeAtual()).toBe(0);
  });

  it('guarda o mudo', () => {
    definirMudo(true);
    expect(estaMudo()).toBe(true);
    definirMudo(false);
    expect(estaMudo()).toBe(false);
  });
});

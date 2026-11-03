import { describe, expect, it } from 'vitest';
import { codigoDoEndereco, formatarCodigo, linkDoConvite, mensagemDeErro, teclasDoCodigo } from './mensagens.js';

describe('código do convite', () => {
  it('lê o código do link e aceita minúsculas', () => {
    expect(codigoDoEndereco('?sala=BRTK-42')).toBe('BRTK-42');
    expect(codigoDoEndereco('?sala=brtk-42')).toBe('BRTK-42');
  });

  it('ignora o que não é código', () => {
    for (const busca of ['', '?sala=', '?sala=GATO-42', '?sala=<script>', '?x=BRTK-42']) {
      expect(codigoDoEndereco(busca)).toBeNull();
    }
  });

  it('monta o link que abre a sala', () => {
    const link = linkDoConvite('https://x.test', 'BRTK-42');
    expect(link).toBe('https://x.test/?sala=BRTK-42');
    expect(codigoDoEndereco(new URL(link).search)).toBe('BRTK-42');
  });

  it('mostra letras primeiro, depois números, e põe o traço', () => {
    expect(teclasDoCodigo('BRT')).toContain('B');
    expect(teclasDoCodigo('BRTK')).toContain('4');
    expect(formatarCodigo('BRTK')).toBe('BRTK');
    expect(formatarCodigo('BRTK42')).toBe('BRTK-42');
  });
});

describe('mensagens', () => {
  it('erro desconhecido ainda dá uma mensagem', () => {
    expect(mensagemDeErro('qualquer')).toMatch(/errado/);
    expect(mensagemDeErro('sala-cheia')).toMatch(/cheia/);
  });
});

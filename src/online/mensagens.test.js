import { describe, expect, it } from 'vitest';
import { codigoDoEndereco, formatarCodigo, linkDoConvite, mensagemDeErro, teclasDoCodigo, textoDeQuemSaiu } from './mensagens.js';

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

describe('quem saiu, no resultado', () => {
  const j = (nome, saiu) => ({ nome, saiu });

  it('não diz nada quando ninguém saiu', () => {
    expect(textoDeQuemSaiu([j('Lalá'), j('Bóris')], false)).toBeNull();
  });

  it('explica a partida que acabou por saída', () => {
    expect(textoDeQuemSaiu([j('Lalá'), j('Bóris', true)], true)).toBe('Bóris, seu adversário, saiu da partida. Quem ficou venceu!');
    expect(textoDeQuemSaiu([j('Lalá', true), j('Bóris', true), j('Til')], true)).toBe('Lalá e Bóris, seus adversários, saíram da partida. Quem ficou venceu!');
  });

  it('avisa quem saiu de uma partida que continuou', () => {
    expect(textoDeQuemSaiu([j('Lalá', true), j('Bóris'), j('Til', true)], false)).toBe('Lalá e Til saíram da partida.');
  });
});

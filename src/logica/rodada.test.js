import { describe, expect, it } from 'vitest';
import banco from '../data/palavras.json';
import { montarRodada } from './rodada.js';
import { letrasDoTexto } from './texto.js';

function gerador(semente) {
  let x = semente;
  return () => {
    x = (x * 9301 + 49297) % 233280;
    return x / 233280;
  };
}

const NIVEIS = ['iniciante', 'intermediario', 'avancado'];

describe('montarRodada', () => {
  it.each(['intermediario', 'avancado'])('%s: não tem opções de resposta', (nivel) => {
    for (const p of montarRodada(banco[nivel], nivel, gerador(3)).paineis) {
      expect(p.opcoes).toBeNull();
    }
  });

  it('iniciante: 3 painéis do mesmo tema, com 3 opções de fora da partida', () => {
    const nivel = 'iniciante';
    const temas = banco[nivel];
    for (let semente = 1; semente <= 200; semente++) {
      const rodada = montarRodada(temas, nivel, gerador(semente));
      const tema = temas.find((t) => t.tema === rodada.tema);
      const textos = rodada.paineis.map((p) => p.texto);

      expect(new Set(textos).size).toBe(3);
      for (const p of rodada.paineis) {
        expect(tema.itens.some((i) => i.texto === p.texto)).toBe(true);
        expect(new Set(p.opcoes).size).toBe(3);
        expect(p.opcoes).toContain(p.texto);
        for (const errada of p.opcoes.filter((o) => o !== p.texto)) {
          expect(textos).not.toContain(errada);
        }
      }
    }
  });

  it('o teclado sempre contém todas as letras do painel', () => {
    for (const nivel of NIVEIS) {
      for (let semente = 1; semente <= 100; semente++) {
        for (const p of montarRodada(banco[nivel], nivel, gerador(semente)).paineis) {
          for (const letra of letrasDoTexto(p.texto)) expect(p.letras).toContain(letra);
        }
      }
    }
  });

  it('o iniciante tem teclado reduzido, com 4 letras extras', () => {
    const { paineis } = montarRodada(banco.iniciante, 'iniciante', gerador(7));
    for (const p of paineis) {
      expect(p.letras.length).toBe(new Set(letrasDoTexto(p.texto)).size + 4);
      expect(new Set(p.letras).size).toBe(p.letras.length);
    }
  });

  it('os outros níveis usam o alfabeto completo', () => {
    const { paineis } = montarRodada(banco.avancado, 'avancado', gerador(7));
    expect(paineis[0].letras).toHaveLength(26);
  });

  it('prioriza opções erradas que começam com a mesma letra', () => {
    const temas = [
      { tema: 'A', itens: ['BOLA', 'PATO', 'VACA'].map((texto) => ({ texto })) },
      { tema: 'B', itens: ['BOLO', 'BODE', 'SUCO', 'PERA', 'COCO'].map((texto) => ({ texto })) },
    ];
    const rodada = montarRodada(temas, 'iniciante', () => 0);
    const bola = rodada.paineis.find((p) => p.texto === 'BOLA');
    expect(bola.opcoes.filter((o) => o !== 'BOLA').sort()).toEqual(['BODE', 'BOLO']);
  });
});

import { useEffect, useRef } from 'react';
import { FASES, JOGADAS, MODOS } from '../logica/jogo.js';
import { atrasoDaCelebracao, atrasoDoEstouro, contarCasas, passoDaOnda } from '../componentes/celebracao.js';
import { tocarEfeito, tocarJingle } from './motor.js';

// Escolhe o som olhando só a mudança de estado: as regras não sabem que existe áudio.
export function useEfeitosDoJogo(estado) {
  const anterior = useRef(estado);

  useEffect(() => {
    const antes = anterior.current;
    anterior.current = estado;
    if (antes === estado) return;

    const jogada = estado.ultimaJogada;
    const novaJogada = jogada && jogada !== antes.ultimaJogada;
    if (novaJogada && jogada.tipo === JOGADAS.LETRA_CERTA) {
      tocarEfeito('letraCerta', { quantidade: jogada.quantidade });
    } else if (novaJogada && jogada.tipo === JOGADAS.LETRA_ERRADA) {
      tocarEfeito('letraErrada');
    } else if (novaJogada && jogada.tipo === JOGADAS.CHUTE_ERRADO) {
      tocarEfeito('chuteErrado');
    }

    if (estado.fase === FASES.RESOLVIDO && antes.fase !== FASES.RESOLVIDO) {
      // Mesmos tempos da animação do painel: o som acompanha a onda e o estouro de confete.
      const casas = contarCasas(estado.paineis[estado.indicePainel].texto);
      const atraso = atrasoDaCelebracao(estado) / 1000;
      const competitivo = estado.modo === MODOS.COMPETITIVO;
      tocarEfeito('celebracao', { casas, passo: passoDaOnda(casas) / 1000, comJingle: competitivo }, atraso);
      if (competitivo) {
        tocarJingle(estado.jogadores[estado.vez].id, atraso + atrasoDoEstouro(casas) / 1000);
      }
    }
  }, [estado]);
}

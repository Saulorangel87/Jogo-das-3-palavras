import { useEffect, useRef } from 'react';
import { FASES, JOGADAS, MODOS } from '../logica/jogo.js';
import { tocarEfeito, tocarJingle } from './motor.js';

const ATRASO_DEPOIS_DA_LETRA = 0.45;

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
      // Se a última letra abriu o painel, espera o som da letra terminar.
      const atraso = novaJogada ? ATRASO_DEPOIS_DA_LETRA : 0;
      if (estado.modo === MODOS.COMPETITIVO) tocarJingle(estado.jogadores[estado.vez].id, atraso);
      else tocarEfeito('resolvido', {}, atraso);
    }
  }, [estado]);
}

import { useEffect, useRef } from 'react';
import { FASES, FATIAS_ROLETA, JOGADAS, MODOS } from '../logica/jogo.js';
import { DURACAO_GIRO } from '../componentes/giro.js';
import { atrasoDaCelebracao, atrasoDoEstouro, contarCasas, passoDaOnda } from '../componentes/celebracao.js';
import { tocarEfeito, tocarJingle } from './motor.js';

const DEPOIS_DO_GIRO = DURACAO_GIRO / 1000;
const VALOR_DO_JACKPOT = (FATIAS_ROLETA.find((f) => f.jackpot) || {}).valor;

// Escolhe o som olhando só a mudança de estado: as regras não sabem que existe áudio.
export function useEfeitosDoJogo(estado) {
  const anterior = useRef(estado);

  useEffect(() => {
    const antes = anterior.current;
    anterior.current = estado;
    if (antes === estado) return;

    const jogada = estado.ultimaJogada;
    const novaJogada = jogada && jogada !== antes.ultimaJogada;
    // O que sai da roleta toca só depois que ela para de girar.
    if (novaJogada && jogada.tipo === JOGADAS.LETRA_CERTA) {
      tocarEfeito('letraCerta', { quantidade: jogada.quantidade }, jogada.gratis ? DEPOIS_DO_GIRO : 0);
    } else if (novaJogada && [JOGADAS.BONUS, JOGADAS.ESCUDO, JOGADAS.GIRO_EXTRA].includes(jogada.tipo)) {
      tocarEfeito('premio', {}, DEPOIS_DO_GIRO);
    } else if (novaJogada && jogada.tipo === JOGADAS.SONECA) {
      tocarEfeito('soneca', {}, DEPOIS_DO_GIRO);
    } else if (novaJogada && jogada.tipo === JOGADAS.LETRA_ERRADA) {
      tocarEfeito('letraErrada');
    } else if (novaJogada && (jogada.tipo === JOGADAS.CHUTE_ERRADO || jogada.tipo === JOGADAS.TEMPO_ESGOTADO)) {
      tocarEfeito('chuteErrado');
    }

    if (VALOR_DO_JACKPOT && antes.valorRoleta === null && estado.valorRoleta === VALOR_DO_JACKPOT) {
      tocarEfeito('jackpot', {}, DEPOIS_DO_GIRO);
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

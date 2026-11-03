import { useEffect } from 'react';
import { FASES } from '../logica/jogo.js';
import { contarCasasFechadas, letrasDoTexto } from '../logica/texto.js';
import { abafarMusica, definirAndamentoDaMusica, pedirMusica } from './motor.js';
import { faixaDoTema } from './musica.js';

// O que a música deve fazer em cada tela. Início e configuração: abertura. Jogo: a faixa do
// tema, acelerando conforme o painel abre. Resultado: silêncio, para o som de fim aparecer.
export function situacaoDaMusica(tela, partida) {
  if (tela !== 'jogo' || !partida) return { faixa: 'abertura', progresso: 0, painel: 0, abafar: false };
  if (partida.fase === FASES.FIM) return { faixa: null, progresso: 0, painel: 0, abafar: false };

  const painel = partida.paineis[partida.indicePainel];
  const total = letrasDoTexto(painel.texto).length;
  const abertas = total - contarCasasFechadas(painel.texto, partida.letrasUsadas);
  const resolvido = partida.fase === FASES.RESOLVIDO;
  return {
    faixa: faixaDoTema(partida.tema),
    progresso: resolvido ? 1 : abertas / Math.max(total, 1),
    painel: partida.indicePainel,
    abafar: resolvido,
  };
}

export function useMusica(tela, partida) {
  const { faixa, progresso, painel, abafar } = situacaoDaMusica(tela, partida);
  // Define antes de pedir a faixa: a trilha nova já nasce no andamento certo.
  definirAndamentoDaMusica(progresso, painel);
  useEffect(() => {
    pedirMusica(faixa);
  }, [faixa]);
  useEffect(() => {
    abafarMusica(abafar);
  }, [abafar]);
}

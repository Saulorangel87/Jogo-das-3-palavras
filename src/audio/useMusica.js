import { useEffect } from 'react';
import { pedirMusica } from './motor.js';
import { faixaDoTema } from './musica.js';

// Qual trilha cada tela pede: abertura no início e na configuração, a faixa do tema no jogo,
// e silêncio no resultado, para o som de fim de partida aparecer.
export function faixaDaTela(tela, tema, acabou) {
  if (tela === 'jogo') return acabou ? null : faixaDoTema(tema);
  return 'abertura';
}

export function useMusica(tela, tema, acabou) {
  const faixa = faixaDaTela(tela, tema, acabou);
  useEffect(() => {
    pedirMusica(faixa);
  }, [faixa]);
}

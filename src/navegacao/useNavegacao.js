import { useEffect, useRef } from 'react';
import { escolherDestino } from './espacial.js';

const SETAS = { 37: 'esquerda', 38: 'cima', 39: 'direita', 40: 'baixo' };
// Escape, Backspace, Voltar do Tizen e Voltar do webOS.
const TECLAS_VOLTAR = [27, 8, 10009, 461];
const TECLA_OK = 13;
const FOCAVEIS = 'button:not([disabled])';

function raizAtiva() {
  return document.querySelector('[data-modal]') || document;
}

function focarInicial() {
  const raiz = raizAtiva();
  const alvo =
    raiz.querySelector(`[data-foco-inicial]:not([disabled])`) ||
    raiz.querySelector(FOCAVEIS);
  if (alvo) alvo.focus();
}

function focoPerdido() {
  const ativo = document.activeElement;
  return !ativo || ativo === document.body || ativo.disabled;
}

function moverFoco(direcao) {
  if (focoPerdido()) {
    focarInicial();
    return;
  }
  const candidatos = Array.from(raizAtiva().querySelectorAll(FOCAVEIS)).filter(
    (el) => el !== document.activeElement,
  );
  const destino = escolherDestino(
    document.activeElement.getBoundingClientRect(),
    candidatos.map((el) => el.getBoundingClientRect()),
    direcao,
  );
  if (destino >= 0) candidatos[destino].focus();
}

// Instalar uma vez no App: setas movem o foco entre os botões.
export function useSetas() {
  useEffect(() => {
    function aoPressionar(evento) {
      // Segurar o OK não pode clicar nos botões das telas seguintes.
      if (evento.keyCode === TECLA_OK && evento.repeat) {
        evento.preventDefault();
        return;
      }
      const direcao = SETAS[evento.keyCode];
      if (!direcao) return;
      evento.preventDefault();
      moverFoco(direcao);
    }
    window.addEventListener('keydown', aoPressionar);
    // Em TV, a página pode abrir sem o teclado: as teclas ficam com o navegador até ela ser ativada.
    window.focus();
    return () => window.removeEventListener('keydown', aoPressionar);
  }, []);
}

// Cada tela informa o que a tecla Voltar faz nela.
export function useVoltar(aoVoltar) {
  const atual = useRef(aoVoltar);
  useEffect(() => {
    atual.current = aoVoltar;
  });
  useEffect(() => {
    function aoPressionar(evento) {
      if (!TECLAS_VOLTAR.includes(evento.keyCode)) return;
      evento.preventDefault();
      if (atual.current) atual.current();
    }
    window.addEventListener('keydown', aoPressionar);
    return () => window.removeEventListener('keydown', aoPressionar);
  }, []);
}

// Foca o botão inicial quando `chave` muda e recupera o foco se o botão focado sumir.
export function useFoco(chave) {
  const ultimaChave = useRef(null);
  useEffect(() => {
    if (ultimaChave.current !== chave || focoPerdido()) focarInicial();
    ultimaChave.current = chave;
  });
}

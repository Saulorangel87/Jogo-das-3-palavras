import { useEffect, useState } from 'react';
import { estadoDoAudio, estaMudo, tocarEfeito, volumeAtual, volumeDaMusica } from '../audio/motor.js';
import './Diagnostico.css';

function ler(ultimaTecla, teclas) {
  const ativo = document.activeElement;
  return [
    ['Tecla', ultimaTecla === null ? 'nenhuma ainda' : `código ${ultimaTecla} (${teclas} no total)`],
    ['Página com teclado', document.hasFocus() ? 'sim' : 'NÃO'],
    ['Página escondida', document.hidden ? 'SIM' : 'não'],
    ['Foco em', ativo && ativo !== document.body ? ativo.textContent.slice(0, 20) : 'nenhum botão'],
    ['Áudio', estadoDoAudio()],
    ['Mudo', estaMudo() ? 'SIM' : 'não'],
    ['Volumes', `efeitos ${Math.round(volumeAtual() * 100)}%, música ${Math.round(volumeDaMusica() * 100)}%`],
    ['Navegador', navigator.userAgent.slice(0, 90)],
  ];
}

// Só aparece com ?diag no endereço: mostra na própria TV o que o jogo está recebendo.
// Nada é enviado a lugar nenhum. Cada tecla toca um som de teste.
export default function Diagnostico() {
  const [linhas, setLinhas] = useState(() => ler(null, 0));

  useEffect(() => {
    let ultima = null;
    let total = 0;
    function aoPressionar(evento) {
      ultima = evento.keyCode;
      total += 1;
      tocarEfeito('letraCerta');
    }
    window.addEventListener('keydown', aoPressionar);
    const relogio = setInterval(() => setLinhas(ler(ultima, total)), 300);
    return () => {
      window.removeEventListener('keydown', aoPressionar);
      clearInterval(relogio);
    };
  }, []);

  return (
    <dl className="diagnostico" aria-hidden="true">
      {linhas.map(([nome, valor]) => (
        <div key={nome}>
          <dt>{nome}:</dt> <dd>{valor}</dd>
        </div>
      ))}
    </dl>
  );
}

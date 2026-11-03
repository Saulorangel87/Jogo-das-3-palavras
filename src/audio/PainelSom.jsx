import { useState } from 'react';
import {
  ajustarVolume,
  definirMudo,
  estaMudo,
  iniciarAudio,
  tocarEfeito,
  volumeAtual,
} from './motor.js';
import './PainelSom.css';

const PASSOS = 10;

export default function PainelSom({ aoFechar }) {
  const [, atualizar] = useState(0);
  const mudo = estaMudo();
  const nivel = Math.round(volumeAtual() * PASSOS);

  function mudar(delta) {
    iniciarAudio();
    // Mexer no volume com o som mudo é pedir som de volta.
    if (mudo) definirMudo(false);
    ajustarVolume(delta / PASSOS);
    atualizar((n) => n + 1);
    // Som de exemplo, para ouvir o novo volume.
    tocarEfeito('letraCerta');
  }

  function alternarMudo() {
    iniciarAudio();
    definirMudo(!mudo);
    atualizar((n) => n + 1);
  }

  return (
    <div className="som-fundo" data-modal role="dialog" aria-modal="true" aria-labelledby="titulo-som">
      <div className="som-caixa">
        <h2 id="titulo-som">Som</h2>
        <div className="som-linha">
          <button className="botao som-passo" aria-label="Diminuir o volume" onClick={() => mudar(-1)}>
            −
          </button>
          <div className="som-volume" role="img" aria-label={`Volume em ${nivel * PASSOS}%`}>
            <div className="som-barras">
              {Array.from({ length: PASSOS }, (_, i) => (
                <span key={i} className={i < nivel && !mudo ? 'som-barra som-barra-cheia' : 'som-barra'} />
              ))}
            </div>
            <span className="som-texto">{mudo ? 'Mudo' : `${nivel * PASSOS}%`}</span>
          </div>
          <button className="botao som-passo" data-foco-inicial aria-label="Aumentar o volume" onClick={() => mudar(1)}>
            +
          </button>
        </div>
        <div className="grade grade-2 som-botoes">
          <button className="botao botao-secundario" onClick={alternarMudo}>
            {mudo ? 'Ligar o som' : 'Silenciar'}
          </button>
          <button className="botao" onClick={aoFechar}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

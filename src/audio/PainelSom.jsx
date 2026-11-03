import { useState } from 'react';
import {
  ajustarVolume,
  ajustarVolumeDaMusica,
  definirMudo,
  estaMudo,
  iniciarAudio,
  tocarEfeito,
  volumeAtual,
  volumeDaMusica,
} from './motor.js';
import './PainelSom.css';

const PASSOS = 10;

// Uma linha de volume: − barras +. Os dois canais (efeitos e música) usam a mesma.
function ControleDeVolume({ rotulo, nivel, mudo, aoMudar, focoInicial }) {
  return (
    <div className="som-canal">
      <h3 className="som-rotulo">{rotulo}</h3>
      <div className="som-linha">
        <button className="botao som-passo" aria-label={`Diminuir o volume de ${rotulo.toLowerCase()}`} onClick={() => aoMudar(-1)}>
          −
        </button>
        <div className="som-volume" role="img" aria-label={`${rotulo}: ${nivel * PASSOS}%`}>
          <div className="som-barras">
            {Array.from({ length: PASSOS }, (_, i) => (
              <span key={i} className={i < nivel && !mudo ? 'som-barra som-barra-cheia' : 'som-barra'} />
            ))}
          </div>
          <span className="som-texto">{mudo ? 'Mudo' : `${nivel * PASSOS}%`}</span>
        </div>
        <button
          className="botao som-passo"
          data-foco-inicial={focoInicial ? true : undefined}
          aria-label={`Aumentar o volume de ${rotulo.toLowerCase()}`}
          onClick={() => aoMudar(1)}
        >
          +
        </button>
      </div>
    </div>
  );
}

export default function PainelSom({ aoFechar }) {
  const [, atualizar] = useState(0);
  const mudo = estaMudo();

  function mudar(ajustar, exemplo) {
    return (delta) => {
      iniciarAudio();
      // Mexer no volume com o som mudo é pedir som de volta.
      if (mudo) definirMudo(false);
      ajustar(delta / PASSOS);
      atualizar((n) => n + 1);
      // Efeitos têm um som de exemplo; a música já está tocando e dispensa.
      if (exemplo) tocarEfeito('letraCerta');
    };
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
        <ControleDeVolume
          rotulo="Efeitos"
          nivel={Math.round(volumeAtual() * PASSOS)}
          mudo={mudo}
          aoMudar={mudar(ajustarVolume, true)}
          focoInicial
        />
        <ControleDeVolume
          rotulo="Música"
          nivel={Math.round(volumeDaMusica() * PASSOS)}
          mudo={mudo}
          aoMudar={mudar(ajustarVolumeDaMusica, false)}
        />
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

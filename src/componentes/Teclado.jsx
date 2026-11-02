import { contarOcorrencias } from '../logica/texto.js';
import './Teclado.css';

export default function Teclado({ letras, usadas, texto, habilitado, aoEscolher, focoInicial }) {
  const primeira = letras.find((l) => !usadas.includes(l));

  return (
    <div className="teclado">
      {letras.map((letra) => {
        const usada = usadas.includes(letra);
        const classes = ['botao', 'teclado-letra'];
        if (usada) {
          classes.push(contarOcorrencias(texto, letra) > 0 ? 'teclado-certa' : 'teclado-errada');
        }
        return (
          <button
            key={letra}
            className={classes.join(' ')}
            disabled={usada || !habilitado}
            data-foco-inicial={focoInicial && letra === primeira ? '' : undefined}
            onClick={() => aoEscolher(letra)}
          >
            {letra}
          </button>
        );
      })}
    </div>
  );
}

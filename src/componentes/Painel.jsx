import { normalizarLetra } from '../logica/texto.js';
import './Painel.css';

export default function Painel({ texto, letrasUsadas, aberto }) {
  const palavras = texto.split(' ');
  const descricao = palavras
    .map((palavra) =>
      palavra
        .split('')
        .map((letra) =>
          aberto || letrasUsadas.includes(normalizarLetra(letra)) ? letra : 'vazio',
        )
        .join(' '),
    )
    .join(', ');

  return (
    <div className="painel" role="img" aria-label={`Painel: ${descricao}`}>
      {palavras.map((palavra, i) => (
        <div key={i} className="painel-palavra">
          {palavra.split('').map((letra, j) => {
            const visivel = aberto || letrasUsadas.includes(normalizarLetra(letra));
            return (
              <span key={j} className={visivel ? 'painel-casa painel-casa-aberta' : 'painel-casa'}>
                {visivel ? letra : ''}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}

import { normalizarLetra } from '../logica/texto.js';
import './Painel.css';

// `digitadas` só existe enquanto o jogador preenche as casas para resolver.
export default function Painel({ texto, letrasUsadas, aberto, digitadas }) {
  let casaFechada = 0;

  const palavras = texto.split(' ').map((palavra) =>
    palavra.split('').map((letra) => {
      if (aberto || letrasUsadas.includes(normalizarLetra(letra))) {
        return { letra, classe: 'painel-casa painel-casa-aberta' };
      }
      const indice = casaFechada;
      casaFechada += 1;
      if (digitadas && indice < digitadas.length) {
        return { letra: digitadas[indice], classe: 'painel-casa painel-casa-digitada' };
      }
      if (digitadas && indice === digitadas.length) {
        return { letra: '', classe: 'painel-casa painel-casa-proxima' };
      }
      return { letra: '', classe: 'painel-casa' };
    }),
  );

  const descricao = palavras
    .map((casas) => casas.map((c) => c.letra || 'vazio').join(' '))
    .join(', ');

  return (
    <div className="painel" role="img" aria-label={`Painel: ${descricao}`}>
      {palavras.map((casas, i) => (
        <div key={i} className="painel-palavra">
          {casas.map((casa, j) => (
            <span key={j} className={casa.classe}>{casa.letra}</span>
          ))}
        </div>
      ))}
    </div>
  );
}

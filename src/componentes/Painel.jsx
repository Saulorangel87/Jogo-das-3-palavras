import { normalizarLetra } from '../logica/texto.js';
import { atrasoDoEstouro, passoDaOnda } from './celebracao.js';
import Festa from './Festa.jsx';
import './Painel.css';

// `digitadas` só existe enquanto o jogador preenche as casas para resolver.
// `atraso` (em ms) adia a comemoração quando o som de uma letra ainda está tocando.
export default function Painel({ texto, letrasUsadas, aberto, digitadas, atraso = 0 }) {
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

  // Ao resolver, as casas dão um pulinho em onda. O passo encolhe nas frases longas
  // para a onda inteira durar menos de um segundo (os tempos vêm de celebracao.js, como no som).
  const total = palavras.reduce((soma, casas) => soma + casas.length, 0);
  const passo = passoDaOnda(total);
  let posicao = 0;

  const descricao = palavras
    .map((casas) => casas.map((c) => c.letra || 'vazio').join(' '))
    .join(', ');

  return (
    <div
      className={aberto ? 'painel painel-resolvido' : 'painel'}
      style={aberto ? { animationDelay: `${atraso + atrasoDoEstouro(total) - 100}ms` } : undefined}
      role="img"
      aria-label={`Painel: ${descricao}`}
    >
      {palavras.map((casas, i) => (
        <div key={i} className="painel-palavra">
          {casas.map((casa, j) => (
            <span
              key={j}
              className={casa.classe}
              style={aberto ? { animationDelay: `${atraso + passo * posicao++}ms` } : undefined}
            >
              {casa.letra}
            </span>
          ))}
        </div>
      ))}
      {aberto && <Festa atraso={atraso + atrasoDoEstouro(total)} />}
    </div>
  );
}

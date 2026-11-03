import { useEffect, useState } from 'react';
import BotaoSom from '../audio/BotaoSom.jsx';
import PainelSom from '../audio/PainelSom.jsx';
import { useFoco, useVoltar } from '../navegacao/useNavegacao.js';
import { pareceTV } from '../navegacao/tv.js';
import Fundo from '../fundos/Fundo.jsx';
import './Inicio.css';

// Em TV, a página pode abrir sem receber as teclas do controle: elas ficam com o navegador
// até o primeiro clique, e o jogo não tem como pedi-las de volta.
function usePrecisaDeClique() {
  const [precisa, setPrecisa] = useState(() => pareceTV(navigator.userAgent) && !document.hasFocus());
  useEffect(() => {
    const atualizar = () => setPrecisa(pareceTV(navigator.userAgent) && !document.hasFocus());
    window.addEventListener('focus', atualizar);
    window.addEventListener('blur', atualizar);
    return () => {
      window.removeEventListener('focus', atualizar);
      window.removeEventListener('blur', atualizar);
    };
  }, []);
  return precisa;
}

export default function Inicio({ aoJogar, aoJogarOnline, aviso }) {
  const [somAberto, setSomAberto] = useState(false);
  const precisaDeClique = usePrecisaDeClique();

  useFoco(`inicio-${somAberto}`);
  useVoltar(somAberto ? () => setSomAberto(false) : null);

  return (
    <main className="tela">
      <Fundo tipo="inicio" />
      <h1 className="inicio-logo">3 Palavras</h1>
      <p className="inicio-frase">Gire a roleta e descubra as palavras!</p>
      {aviso && <p className="inicio-aviso" role="alert">{aviso}</p>}
      {precisaDeClique && (
        <p className="inicio-tv" role="status">Na TV: aponte o controle para a tela e clique uma vez para usar as setas e ligar o som.</p>
      )}
      <button className="botao inicio-botao" onClick={aoJogar}>Jogar</button>
      <button className="botao botao-secundario inicio-online" onClick={aoJogarOnline}>Jogar online</button>
      <BotaoSom className="inicio-som" aoAbrir={() => setSomAberto(true)} />
      {somAberto && <PainelSom aoFechar={() => setSomAberto(false)} />}
    </main>
  );
}

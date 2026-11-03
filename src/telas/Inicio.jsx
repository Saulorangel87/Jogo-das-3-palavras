import { useState } from 'react';
import BotaoSom from '../audio/BotaoSom.jsx';
import PainelSom from '../audio/PainelSom.jsx';
import { useFoco, useVoltar } from '../navegacao/useNavegacao.js';
import './Inicio.css';

export default function Inicio({ aoJogar, aviso }) {
  const [somAberto, setSomAberto] = useState(false);

  useFoco(`inicio-${somAberto}`);
  useVoltar(somAberto ? () => setSomAberto(false) : null);

  return (
    <main className="tela">
      <h1 className="inicio-logo">3 Palavras</h1>
      <p className="inicio-frase">Gire a roleta e descubra as palavras!</p>
      {aviso && <p className="inicio-aviso" role="alert">{aviso}</p>}
      <button className="botao inicio-botao" onClick={aoJogar}>Jogar</button>
      <BotaoSom className="inicio-som" aoAbrir={() => setSomAberto(true)} />
      {somAberto && <PainelSom aoFechar={() => setSomAberto(false)} />}
    </main>
  );
}

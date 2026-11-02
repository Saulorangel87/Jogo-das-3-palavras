import { useFoco, useVoltar } from '../navegacao/useNavegacao.js';
import './Inicio.css';

export default function Inicio({ aoJogar, aviso }) {
  useFoco('inicio');
  useVoltar(null);

  return (
    <main className="tela">
      <h1 className="inicio-logo">3 Palavras</h1>
      <p className="inicio-frase">Gire a roleta e descubra as palavras!</p>
      {aviso && <p className="inicio-aviso" role="alert">{aviso}</p>}
      <button className="botao inicio-botao" onClick={aoJogar}>Jogar</button>
    </main>
  );
}

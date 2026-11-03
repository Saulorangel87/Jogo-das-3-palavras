import { estaMudo } from './motor.js';

// O botão só abre o painel de som: quem o usa decide onde mostrá-lo.
export default function BotaoSom({ aoAbrir, className = '' }) {
  return (
    <button className={`botao botao-secundario botao-som ${className}`} onClick={aoAbrir}>
      {estaMudo() ? 'Som mudo' : 'Som'}
    </button>
  );
}

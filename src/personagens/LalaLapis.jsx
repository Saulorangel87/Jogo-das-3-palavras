import Rosto from './Rosto.jsx';

export default function LalaLapis({ expressao }) {
  return (
    <g>
      <polygon points="30,32 50,6 70,32" fill="#f5d7a1" />
      <polygon points="44.5,13 50,6 55.5,13" fill="#14213d" />
      <rect x="30" y="31" width="40" height="53" fill="#ffc93c" />
      <rect x="30" y="31" width="7" height="53" fill="#f4a820" />
      <rect x="63" y="31" width="7" height="53" fill="#f4a820" />
      <rect x="30" y="80" width="40" height="5" fill="#9aa7c7" />
      <rect x="30" y="85" width="40" height="8" rx="3" fill="#ff8fab" />
      <path d="M26 34 L35 38 L26 43 Z M44 34 L35 38 L44 43 Z" fill="#e63973" />
      <circle cx="35" cy="38" r="2.2" fill="#b0174f" />
      <Rosto expressao={expressao} cy={54} abertura={9} raio={5.5} bocaY={13} largura={7} />
    </g>
  );
}

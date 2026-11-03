import Rosto from './Rosto.jsx';

export default function CapitaoTil({ expressao }) {
  return (
    <g>
      <circle cx="50" cy="58" r="31" fill="#f6c9a0" />
      <path d="M24 38 L28 14 Q50 4 72 14 L76 38 Z" fill="#17306b" />
      <rect x="18" y="33" width="64" height="8" rx="4" fill="#0b1c3d" />
      <path d="M38 24 q6 -7 12 0 t12 0" fill="none" stroke="#ffd23f" strokeWidth="4" strokeLinecap="round" />
      <Rosto expressao={expressao} cy={52} abertura={12} raio={6} bocaY={26} largura={7} />
      <path d="M31 72 q9.5 -9 19 0 t19 0" fill="none" stroke="#5a3a1e" strokeWidth="6" strokeLinecap="round" />
    </g>
  );
}

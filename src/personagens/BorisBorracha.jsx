import Rosto from './Rosto.jsx';

export default function BorisBorracha({ expressao }) {
  return (
    <g>
      <rect x="20" y="22" width="60" height="70" rx="13" fill="#ff8fab" />
      <path d="M20 64 H80 V79 A13 13 0 0 1 67 92 H33 A13 13 0 0 1 20 79 Z" fill="#3a6fd8" />
      <rect x="20" y="64" width="60" height="4" fill="#fdf6e3" />
      <rect x="30" y="24" width="12" height="4" rx="2" fill="#ffc2d1" />
      <Rosto expressao={expressao} cy={40} abertura={13} raio={7} bocaY={14} />
    </g>
  );
}

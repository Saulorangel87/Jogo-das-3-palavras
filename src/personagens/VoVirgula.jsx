import Rosto from './Rosto.jsx';

export default function VoVirgula({ expressao }) {
  return (
    <g>
      <path d="M68 66 Q72 90 44 96 Q58 86 54 74 Z" fill="#7b4fc9" />
      <circle cx="50" cy="48" r="31" fill="#9b6df0" />
      <circle cx="50" cy="13" r="9" fill="#d9dde8" />
      <path d="M21 42 Q24 18 50 18 Q76 18 79 42 Q64 30 50 30 Q36 30 21 42 Z" fill="#d9dde8" />
      <Rosto expressao={expressao} cy={48} abertura={13} raio={6} bocaY={16} />
      <circle cx="37" cy="48" r="9.5" fill="none" stroke="#14213d" strokeWidth="2" />
      <circle cx="63" cy="48" r="9.5" fill="none" stroke="#14213d" strokeWidth="2" />
      <path d="M46.5 47 Q50 44 53.5 47" fill="none" stroke="#14213d" strokeWidth="2" />
    </g>
  );
}

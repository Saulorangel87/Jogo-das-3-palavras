import Rosto from './Rosto.jsx';

function Bico({ expressao }) {
  if (expressao === 'comemorando') {
    return (
      <g>
        <polygon points="41,57 59,57 50,62" fill="#f4a020" />
        <polygon points="43,64 57,64 50,73" fill="#d97f0a" />
        <rect x="43" y="61" width="14" height="3.5" fill="#7a1f2b" />
      </g>
    );
  }
  return <polygon points="41,58 59,58 50,71" fill="#f4a020" stroke="#d97f0a" strokeWidth="1" />;
}

export default function GalinhaCedilha({ expressao }) {
  return (
    <g>
      <circle cx="39" cy="24" r="8" fill="#e63946" />
      <circle cx="50" cy="19" r="9" fill="#e63946" />
      <circle cx="61" cy="24" r="8" fill="#e63946" />
      <circle cx="50" cy="55" r="31" fill="#fff8e7" />
      <path d="M54 85 q9 3 5 8 q-4 4 -11 1" fill="none" stroke="#d97f0a" strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="50" cy="76" rx="4" ry="5" fill="#e63946" />
      <Rosto expressao={expressao} cy={46} abertura={13} raio={6.5} comBoca={false} />
      <Bico expressao={expressao} />
    </g>
  );
}

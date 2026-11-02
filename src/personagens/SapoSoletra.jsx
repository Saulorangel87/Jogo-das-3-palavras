import Rosto from './Rosto.jsx';

export default function SapoSoletra({ expressao }) {
  return (
    <g>
      <circle cx="30" cy="31" r="14" fill="#3fb57f" />
      <circle cx="70" cy="31" r="14" fill="#3fb57f" />
      <ellipse cx="50" cy="60" rx="40" ry="30" fill="#3fb57f" />
      <ellipse cx="50" cy="80" rx="26" ry="11" fill="#b7f0cf" />
      <text x="50" y="85" fill="#14213d" fontSize="11" fontWeight="800" textAnchor="middle">A B C</text>
      <Rosto expressao={expressao} cy={31} abertura={20} raio={9} bocaY={29} largura={14} />
    </g>
  );
}

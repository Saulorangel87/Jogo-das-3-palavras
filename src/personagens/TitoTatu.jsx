import Rosto from './Rosto.jsx';

export default function TitoTatu({ expressao }) {
  return (
    <g>
      <ellipse cx="50" cy="58" rx="42" ry="34" fill="#7d5c4d" />
      <path d="M12 44 Q50 18 88 44 M9 60 Q50 34 91 60 M12 76 Q50 54 88 76" fill="none" stroke="#5a3f33" strokeWidth="3" />
      <ellipse cx="33" cy="30" rx="6" ry="13" fill="#c9a98c" transform="rotate(-18 33 30)" />
      <ellipse cx="67" cy="30" rx="6" ry="13" fill="#c9a98c" transform="rotate(18 67 30)" />
      <ellipse cx="50" cy="60" rx="24" ry="28" fill="#c9a98c" />
      <ellipse cx="50" cy="73" rx="12" ry="11" fill="#ead9c6" />
      <ellipse cx="50" cy="68" rx="3.5" ry="2.5" fill="#14213d" />
      <Rosto expressao={expressao} cy={51} abertura={11} raio={6} bocaY={25} largura={7} />
    </g>
  );
}

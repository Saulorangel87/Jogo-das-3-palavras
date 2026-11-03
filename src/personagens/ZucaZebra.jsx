import Rosto from './Rosto.jsx';

export default function ZucaZebra({ expressao }) {
  return (
    <g>
      <ellipse cx="29" cy="26" rx="6" ry="12" fill="#fff" stroke="#14213d" strokeWidth="1.5" transform="rotate(-22 29 26)" />
      <ellipse cx="71" cy="26" rx="6" ry="12" fill="#fff" stroke="#14213d" strokeWidth="1.5" transform="rotate(22 71 26)" />
      <rect x="26" y="18" width="48" height="76" rx="23" fill="#fff" />
      <path d="M38 22 L44 6 L50 18 L56 6 L62 22 Z" fill="#14213d" />
      <path d="M26 40 L38 37 L26 46 Z M74 40 L62 37 L74 46 Z M27 56 L36 55 L27 62 Z M73 56 L64 55 L73 62 Z" fill="#14213d" />
      <path d="M43 24 L50 34 L57 24 Z" fill="#14213d" />
      <ellipse cx="50" cy="78" rx="20" ry="15" fill="#3d4663" />
      <circle cx="43" cy="72" r="2" fill="#fff" />
      <circle cx="57" cy="72" r="2" fill="#fff" />
      <Rosto expressao={expressao} cy={51} abertura={12} raio={6} bocaY={29} largura={8} corBoca="#fff" />
    </g>
  );
}

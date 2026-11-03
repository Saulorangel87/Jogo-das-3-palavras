// Olhos e boca compartilhados: é aqui que nascem as 4 expressões.
const COR = '#14213d';

function Olho({ x, y, raio, expressao, ladoEsquerdo }) {
  if (expressao === 'comemorando') {
    const d = `M${x - raio} ${y + 1} Q${x} ${y - raio} ${x + raio} ${y + 1}`;
    return <path d={d} fill="none" stroke={COR} strokeWidth="2.5" strokeLinecap="round" />;
  }

  const pupila = expressao === 'quase' ? raio * 0.35 : raio * 0.5;
  const desvio = expressao === 'pensando' ? raio * 0.35 : 0;
  const sobrancelha =
    expressao === 'quase'
      ? ladoEsquerdo
        ? `M${x - raio} ${y - raio - 1} L${x + raio} ${y - raio - 4}`
        : `M${x - raio} ${y - raio - 4} L${x + raio} ${y - raio - 1}`
      : `M${x - raio} ${y - raio - 3} Q${x} ${y - raio - 6} ${x + raio} ${y - raio - 3}`;

  return (
    <g>
      <circle cx={x} cy={y} r={raio} fill="#fff" stroke={COR} strokeWidth="1" />
      <circle cx={x + desvio} cy={y - desvio} r={pupila} fill={COR} />
      {(expressao === 'quase' || (expressao === 'pensando' && !ladoEsquerdo)) && (
        <path d={sobrancelha} fill="none" stroke={COR} strokeWidth="2" strokeLinecap="round" />
      )}
    </g>
  );
}

function Boca({ x, y, largura, expressao, cor }) {
  if (expressao === 'comemorando') {
    const d = `M${x - largura} ${y} Q${x} ${y + largura * 1.5} ${x + largura} ${y} Z`;
    return <path d={d} fill="#7a1f2b" stroke={COR} strokeWidth="1.5" strokeLinejoin="round" />;
  }
  const passo = largura / 2;
  const caminhos = {
    normal: `M${x - largura} ${y} Q${x} ${y + largura * 0.7} ${x + largura} ${y}`,
    pensando: `M${x - largura * 0.6} ${y + 2} L${x + largura * 0.6} ${y}`,
    quase: `M${x - largura} ${y + 1} q${passo} -3 ${largura} 0 t${largura} 0`,
  };
  return (
    <path d={caminhos[expressao]} fill="none" stroke={cor} strokeWidth="2.5" strokeLinecap="round" />
  );
}

export default function Rosto({
  expressao,
  cx = 50,
  cy = 50,
  abertura = 12,
  raio = 6,
  bocaY = 14,
  largura = 9,
  corBoca = COR,
  comBoca = true,
}) {
  return (
    <g>
      <Olho x={cx - abertura} y={cy} raio={raio} expressao={expressao} ladoEsquerdo />
      <Olho x={cx + abertura} y={cy} raio={raio} expressao={expressao} />
      {comBoca && <Boca x={cx} y={cy + bocaY} largura={largura} expressao={expressao} cor={corBoca} />}
    </g>
  );
}

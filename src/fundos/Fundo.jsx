import './Fundo.css';

// Papéis de parede em SVG, todos originais e desenhados por código: nada de imagem externa,
// nada de filtro ou animação (TV antiga é fraca). Cada tela escolhe o seu pelo nome.
// As peças usam um sorteio com semente fixa, então o desenho é sempre o mesmo.

const LARGURA = 1600;
const ALTURA = 900;
const PALETA = ['#fdf6e3', '#ffd23f', '#95d5b2', '#ffb4a2', '#8ecae6', '#cdb4db'];
const LETRAS = 'ABCDEFGHILMNOPRSTUVÃÇÉÕ?!';

function sorteador(semente) {
  let a = semente;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Peças de letra espalhadas numa grade com folga. Perto do centro ficam mais apagadas,
// para o texto da tela continuar bem legível.
function pecasDeLetra(semente, colunas, linhas, { opMin, opMax, tamMin, tamMax, falha, livre }) {
  const rng = sorteador(semente);
  const pecas = [];
  for (let l = 0; l < linhas; l++) {
    for (let c = 0; c < colunas; c++) {
      if (rng() < falha) continue;
      const x = ((c + 0.2 + rng() * 0.6) / colunas) * LARGURA;
      const y = ((l + 0.2 + rng() * 0.6) / linhas) * ALTURA;
      if (livre && x > livre.x0 && x < livre.x1 && y > livre.y0 && y < livre.y1) continue;
      const dx = (x - LARGURA / 2) / (LARGURA / 2);
      const dy = (y - ALTURA / 2) / (ALTURA / 2);
      const longe = Math.min(1, Math.sqrt(dx * dx + dy * dy));
      pecas.push({
        x,
        y,
        tam: tamMin + rng() * (tamMax - tamMin),
        giro: Math.round(rng() * 60 - 30),
        letra: LETRAS[Math.floor(rng() * LETRAS.length)],
        cor: PALETA[Math.floor(rng() * PALETA.length)],
        op: opMin + (opMax - opMin) * longe,
      });
    }
  }
  return pecas;
}

function Pecas({ pecas }) {
  return pecas.map((p, i) => (
    <g key={i} transform={`translate(${p.x.toFixed(0)} ${p.y.toFixed(0)}) rotate(${p.giro})`} opacity={p.op.toFixed(2)}>
      <rect x={-p.tam / 2} y={-p.tam / 2} width={p.tam} height={p.tam} rx={p.tam * 0.2} fill={p.cor} />
      <text
        y={p.tam * 0.18}
        textAnchor="middle"
        fontSize={p.tam * 0.62}
        fontWeight="700"
        fontFamily="Verdana, Arial, sans-serif"
        fill="#14213d"
      >
        {p.letra}
      </text>
    </g>
  ));
}

function pontosDaEstrela(raio) {
  const pontos = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? raio : raio * 0.45;
    const ang = (Math.PI / 5) * i - Math.PI / 2;
    pontos.push(`${(Math.cos(ang) * r).toFixed(1)},${(Math.sin(ang) * r).toFixed(1)}`);
  }
  return pontos.join(' ');
}

function Estrela({ x, y, raio, cor, op, giro = 0 }) {
  return (
    <polygon
      points={pontosDaEstrela(raio)}
      fill={cor}
      opacity={op}
      transform={`translate(${x} ${y}) rotate(${giro})`}
    />
  );
}

function pontinhos(semente, quantidade) {
  const rng = sorteador(semente);
  const lista = [];
  for (let i = 0; i < quantidade; i++) {
    lista.push({ x: rng() * LARGURA, y: rng() * ALTURA * 0.75, r: 1.5 + rng() * 2.5, op: 0.25 + rng() * 0.5 });
  }
  return lista;
}

// Lápis desenhado deitado, com a ponta para a direita (0,0 = início da borracha).
function Lapis({ x, y, giro, escala = 1, op = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${giro}) scale(${escala})`} opacity={op}>
      <rect x="0" y="-22" width="44" height="44" rx="10" fill="#ffb4a2" />
      <rect x="44" y="-22" width="30" height="44" fill="#b8c4d9" />
      <rect x="52" y="-22" width="4" height="44" fill="#8c9ab5" />
      <rect x="62" y="-22" width="4" height="44" fill="#8c9ab5" />
      <rect x="74" y="-22" width="240" height="44" fill="#ffd23f" />
      <rect x="74" y="-6" width="240" height="6" fill="#e6b800" />
      <polygon points="314,-22 384,0 314,22" fill="#f1d3a3" />
      <polygon points="360,-7 384,0 360,7" fill="#3a3a4a" />
    </g>
  );
}

function Livros({ x, y, op = 1 }) {
  const lombadas = [
    { l: 52, a: 150, cor: '#ffb4a2' },
    { l: 40, a: 190, cor: '#8ecae6' },
    { l: 58, a: 130, cor: '#95d5b2' },
    { l: 44, a: 170, cor: '#ffd23f' },
    { l: 50, a: 145, cor: '#cdb4db' },
  ];
  let cursor = 0;
  return (
    <g transform={`translate(${x} ${y})`} opacity={op}>
      {lombadas.map((b, i) => {
        const bx = cursor;
        cursor += b.l + 4;
        return (
          <g key={i}>
            <rect x={bx} y={-b.a} width={b.l} height={b.a} rx="5" fill={b.cor} />
            <rect x={bx} y={-b.a + 22} width={b.l} height="6" fill="#14213d" opacity="0.25" />
            <rect x={bx} y={-26} width={b.l} height="6" fill="#14213d" opacity="0.25" />
          </g>
        );
      })}
    </g>
  );
}

const PECAS_INICIO = pecasDeLetra(7, 9, 5, { opMin: 0.07, opMax: 0.3, tamMin: 64, tamMax: 104, falha: 0.2, livre: { x0: 430, x1: 1170, y0: 150, y1: 640 } });
const PONTOS_INICIO = pontinhos(3, 46);

function Inicio() {
  return (
    <>
      <defs>
        <linearGradient id="fi-ceu" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#24387a" />
          <stop offset="1" stopColor="#14213d" />
        </linearGradient>
        <radialGradient id="fi-brilho" cx="0.5" cy="0.4" r="0.5">
          <stop offset="0" stopColor="#ffd23f" stopOpacity="0.28" />
          <stop offset="1" stopColor="#ffd23f" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={LARGURA} height={ALTURA} fill="url(#fi-ceu)" />
      <rect width={LARGURA} height={ALTURA} fill="url(#fi-brilho)" />
      {PONTOS_INICIO.map((p, i) => (
        <circle key={i} cx={p.x.toFixed(0)} cy={p.y.toFixed(0)} r={p.r.toFixed(1)} fill="#fdf6e3" opacity={p.op.toFixed(2)} />
      ))}
      <Estrela x={1290} y={150} raio={34} cor="#ffd23f" op="0.8" giro={12} />
      <Estrela x={250} y={210} raio={22} cor="#ffd23f" op="0.6" giro={-10} />
      <Pecas pecas={PECAS_INICIO} />
      <Livros x={70} y={800} op={0.9} />
      <path d="M0 770 C300 690 620 780 900 730 S1400 690 1600 760 V900 H0Z" fill="#1d2f63" />
      <path d="M0 830 C260 780 560 850 860 810 S1380 790 1600 840 V900 H0Z" fill="#17274f" />
      <Lapis x={1180} y={800} giro={-18} escala={0.8} op={0.95} />
    </>
  );
}

const LINHAS_CADERNO = [];
for (let y = 110; y < ALTURA; y += 64) LINHAS_CADERNO.push(y);
const ESPIRAIS = [];
for (let y = 70; y < ALTURA; y += 96) ESPIRAIS.push(y);
const PECAS_CADERNO = pecasDeLetra(21, 9, 5, { opMin: 0.04, opMax: 0.16, tamMin: 54, tamMax: 84, falha: 0.5 });

function Configuracao() {
  return (
    <>
      <rect width={LARGURA} height={ALTURA} fill="#17264d" />
      {LINHAS_CADERNO.map((y) => (
        <rect key={y} x="0" y={y} width={LARGURA} height="3" fill="#8ecae6" opacity="0.13" />
      ))}
      <rect x="190" y="0" width="4" height={ALTURA} fill="#ffb4a2" opacity="0.28" />
      <rect x="199" y="0" width="2" height={ALTURA} fill="#ffb4a2" opacity="0.16" />
      <rect x="0" y="0" width="150" height={ALTURA} fill="#101c3b" opacity="0.55" />
      {ESPIRAIS.map((y) => (
        <g key={y}>
          <circle cx="62" cy={y} r="17" fill="#0c1530" />
          <rect x="30" y={y - 5} width="96" height="10" rx="5" fill="#b8c4d9" opacity="0.5" />
        </g>
      ))}
      <Pecas pecas={PECAS_CADERNO} />
      <Estrela x={1400} y={170} raio={40} cor="#ffd23f" op="0.3" giro={8} />
      <Estrela x={1500} y={300} raio={20} cor="#ffd23f" op="0.22" giro={-14} />
      <Lapis x={1130} y={790} giro={-12} escala={0.8} op={0.3} />
      <g transform="translate(300 80) rotate(-8)" opacity="0.28">
        <rect width="190" height="70" rx="12" fill="#ffb4a2" />
        <rect x="120" width="70" height="70" rx="12" fill="#8ecae6" />
      </g>
      <g transform="translate(1250 90) rotate(6)" opacity="0.22">
        <rect width="300" height="56" rx="6" fill="#ffd23f" />
        {[30, 60, 90, 120, 150, 180, 210, 240, 270].map((tx, i) => (
          <rect key={tx} x={tx} width="3" height={i % 2 === 0 ? 24 : 15} fill="#14213d" />
        ))}
      </g>
    </>
  );
}

const PECAS_JOGO = pecasDeLetra(33, 10, 6, { opMin: 0.02, opMax: 0.06, tamMin: 50, tamMax: 76, falha: 0.6 });

const BRILHO_DO_JOGO = { competitivo: '#ffd23f', cooperativo: '#95d5b2' };

function Jogo({ variante }) {
  const cor = BRILHO_DO_JOGO[variante] || BRILHO_DO_JOGO.competitivo;
  return (
    <>
      <defs>
        <radialGradient id="fj-base" cx="0.5" cy="0.35" r="0.85">
          <stop offset="0" stopColor="#1f3160" />
          <stop offset="1" stopColor="#101b36" />
        </radialGradient>
        <radialGradient id="fj-brilho" cx="0.5" cy="0" r="0.6">
          <stop offset="0" stopColor={cor} stopOpacity="0.2" />
          <stop offset="1" stopColor={cor} stopOpacity="0" />
        </radialGradient>
        <pattern id="fj-trama" width="110" height="110" patternUnits="userSpaceOnUse">
          <rect x="30" y="30" width="50" height="50" rx="12" fill="#fdf6e3" opacity="0.025" />
        </pattern>
      </defs>
      <rect width={LARGURA} height={ALTURA} fill="url(#fj-base)" />
      <rect width={LARGURA} height={ALTURA} fill="url(#fj-trama)" />
      <rect width={LARGURA} height={ALTURA} fill="url(#fj-brilho)" />
      <Pecas pecas={PECAS_JOGO} />
      <Livros x={30} y={890} op={0.18} />
      <Lapis x={1170} y={870} giro={-6} escala={0.8} op={0.16} />
    </>
  );
}

const RAIOS = [];
for (let i = 0; i < 24; i += 2) {
  const a1 = (Math.PI * 2 * i) / 24;
  const a2 = (Math.PI * 2 * (i + 1)) / 24;
  const R = 1500;
  RAIOS.push(
    `0,0 ${(Math.cos(a1) * R).toFixed(0)},${(Math.sin(a1) * R).toFixed(0)} ${(Math.cos(a2) * R).toFixed(0)},${(Math.sin(a2) * R).toFixed(0)}`,
  );
}

function confete(semente, quantidade) {
  const rng = sorteador(semente);
  const lista = [];
  for (let i = 0; i < quantidade; i++) {
    const x = rng() * LARGURA;
    const y = rng() * ALTURA;
    // Deixa o miolo da tela, onde está o texto, mais limpo.
    const dentro = x > 380 && x < 1220 && y > 170 && y < 760;
    if (dentro && rng() < 0.85) continue;
    lista.push({
      x,
      y,
      forma: Math.floor(rng() * 3),
      tam: 12 + rng() * 22,
      giro: Math.round(rng() * 180),
      cor: PALETA[Math.floor(rng() * PALETA.length)],
      op: dentro ? 0.3 : 0.55 + rng() * 0.3,
    });
  }
  return lista;
}

const CONFETES = confete(5, 230);

// Bandeirinhas presas num fio curvo no alto da tela.
const BANDEIRAS = [];
for (let i = 1; i < 16; i++) {
  const t = i / 16;
  const x = (1 - t) * (1 - t) * -20 + 2 * (1 - t) * t * 800 + t * t * 1620;
  const y = (1 - t) * (1 - t) * 30 + 2 * (1 - t) * t * 210 + t * t * 30;
  BANDEIRAS.push({ x, y, cor: PALETA[i % PALETA.length], giro: (t - 0.5) * 40 });
}

function Resultado() {
  return (
    <>
      <defs>
        <linearGradient id="fr-ceu" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2f2a73" />
          <stop offset="1" stopColor="#14213d" />
        </linearGradient>
        <radialGradient id="fr-brilho" cx="0.5" cy="0.45" r="0.5">
          <stop offset="0" stopColor="#ffd23f" stopOpacity="0.18" />
          <stop offset="1" stopColor="#ffd23f" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={LARGURA} height={ALTURA} fill="url(#fr-ceu)" />
      <g transform={`translate(${LARGURA / 2} ${ALTURA * 0.45})`}>
        {RAIOS.map((pontos, i) => (
          <polygon key={i} points={pontos} fill="#ffd23f" opacity="0.045" />
        ))}
      </g>
      <rect width={LARGURA} height={ALTURA} fill="url(#fr-brilho)" />
      {CONFETES.map((c, i) => {
        const base = `translate(${c.x.toFixed(0)} ${c.y.toFixed(0)}) rotate(${c.giro})`;
        if (c.forma === 0) {
          return <rect key={i} x={-c.tam / 2} y={-c.tam / 4} width={c.tam} height={c.tam / 2} fill={c.cor} opacity={c.op.toFixed(2)} transform={base} />;
        }
        if (c.forma === 1) {
          return <circle key={i} r={c.tam / 3} fill={c.cor} opacity={c.op.toFixed(2)} transform={base} />;
        }
        return <polygon key={i} points={pontosDaEstrela(c.tam / 1.5)} fill={c.cor} opacity={c.op.toFixed(2)} transform={base} />;
      })}
      <path d="M-20 30 Q800 210 1620 30" fill="none" stroke="#fdf6e3" strokeWidth="4" opacity="0.5" />
      {BANDEIRAS.map((b, i) => (
        <polygon
          key={i}
          points="-26,0 26,0 0,60"
          fill={b.cor}
          opacity="0.85"
          transform={`translate(${b.x.toFixed(0)} ${b.y.toFixed(0)}) rotate(${b.giro.toFixed(0)})`}
        />
      ))}
    </>
  );
}

const CENAS = { inicio: Inicio, configuracao: Configuracao, jogo: Jogo, resultado: Resultado };

export default function Fundo({ tipo, variante }) {
  const Cena = CENAS[tipo];
  if (!Cena) return null;
  return (
    <div className="fundo" aria-hidden="true">
      <svg viewBox={`0 0 ${LARGURA} ${ALTURA}`} preserveAspectRatio="xMidYMid slice" focusable="false">
        <Cena variante={variante} />
      </svg>
    </div>
  );
}

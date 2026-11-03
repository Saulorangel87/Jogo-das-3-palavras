import './Festa.css';

// Estouro de confete e estrelas que sai do centro do painel. As peças são sempre as mesmas
// (sorteio com semente fixa): leve para a TV e sem surpresa entre uma partida e outra.
const CORES = ['#ffd23f', '#ffb4a2', '#95d5b2', '#8ecae6', '#cdb4db', '#fdf6e3'];
const QUANTIDADE = 34;

function sorteador(semente) {
  let a = semente;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PECAS = (() => {
  const rng = sorteador(11);
  const lista = [];
  for (let i = 0; i < QUANTIDADE; i++) {
    // De cada 3 peças, uma é estrela: sobem mais e caem menos, como faíscas.
    const forma = i % 3 === 2 ? 'estrela' : i % 3 === 1 ? 'bola' : 'retangulo';
    const lado = rng() < 0.5 ? -1 : 1;
    const dx = lado * (6 + rng() * 40);
    const dy = forma === 'estrela' ? -(7 + rng() * 9) : -(1 + rng() * 8);
    lista.push({
      forma,
      cor: CORES[Math.floor(rng() * CORES.length)],
      dx: `${dx.toFixed(1)}vw`,
      dy: `${dy.toFixed(1)}rem`,
      queda: `${(forma === 'estrela' ? 1 : 6 + rng() * 6).toFixed(1)}rem`,
      giro: `${Math.round((rng() * 2 - 1) * 540)}deg`,
      atraso: Math.round(rng() * 120),
    });
  }
  return lista;
})();

export default function Festa({ atraso }) {
  return (
    <div className="festa" aria-hidden="true">
      {PECAS.map((p, i) => (
        <span
          key={i}
          className={`festa-peca festa-${p.forma}`}
          style={{
            background: p.cor,
            animationDelay: `${atraso + p.atraso}ms`,
            '--dx': p.dx,
            '--dy': p.dy,
            '--queda': p.queda,
            '--giro': p.giro,
          }}
        />
      ))}
    </div>
  );
}

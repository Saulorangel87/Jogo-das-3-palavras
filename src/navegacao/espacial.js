// Escolhe o próximo elemento pela posição na tela. Puro: recebe apenas retângulos.

const EIXOS = {
  esquerda: { primario: (o, c) => o.cx - c.cx, cruzado: (o, c) => Math.abs(o.cy - c.cy) },
  direita: { primario: (o, c) => c.cx - o.cx, cruzado: (o, c) => Math.abs(o.cy - c.cy) },
  cima: { primario: (o, c) => o.cy - c.cy, cruzado: (o, c) => Math.abs(o.cx - c.cx) },
  baixo: { primario: (o, c) => c.cy - o.cy, cruzado: (o, c) => Math.abs(o.cx - c.cx) },
};

const PESO_CRUZADO = 2;

function centro(r) {
  return { cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
}

// Devolve o índice do candidato mais próximo na direção pedida, ou -1 se não houver.
export function escolherDestino(origem, candidatos, direcao) {
  const eixo = EIXOS[direcao];
  const o = centro(origem);
  let melhor = -1;
  let menorCusto = Infinity;

  candidatos.forEach((retangulo, i) => {
    const c = centro(retangulo);
    const distancia = eixo.primario(o, c);
    if (distancia <= 1) return;
    const custo = distancia + PESO_CRUZADO * eixo.cruzado(o, c);
    if (custo < menorCusto) {
      menorCusto = custo;
      melhor = i;
    }
  });
  return melhor;
}

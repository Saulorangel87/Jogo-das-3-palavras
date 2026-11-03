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

// Alinhado: ocupa a mesma linha (esquerda/direita) ou a mesma coluna (cima/baixo) da origem.
function alinhado(origem, candidato, direcao) {
  if (direcao === 'esquerda' || direcao === 'direita') {
    return candidato.top < origem.top + origem.height && candidato.top + candidato.height > origem.top;
  }
  return candidato.left < origem.left + origem.width && candidato.left + candidato.width > origem.left;
}

// Devolve o índice do candidato mais próximo na direção pedida, ou -1 se não houver.
// Quem está alinhado sempre vence quem está em outra linha ou coluna, mesmo que mais longe:
// com um botão quase em cima de outro, a seta para o lado não pode descer.
export function escolherDestino(origem, candidatos, direcao) {
  const eixo = EIXOS[direcao];
  const o = centro(origem);
  let melhor = -1;
  let menorCusto = Infinity;
  let melhorAlinhado = false;

  candidatos.forEach((retangulo, i) => {
    const c = centro(retangulo);
    const distancia = eixo.primario(o, c);
    if (distancia <= 1) return;
    const custo = distancia + PESO_CRUZADO * eixo.cruzado(o, c);
    const estaAlinhado = alinhado(origem, retangulo, direcao);
    const vence = estaAlinhado === melhorAlinhado ? custo < menorCusto : estaAlinhado;
    if (vence) {
      menorCusto = custo;
      melhor = i;
      melhorAlinhado = estaAlinhado;
    }
  });
  return melhor;
}

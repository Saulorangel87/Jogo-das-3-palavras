// Janela deslizante simples, por chave (endereço ou conexão). Fica só na memória.
export function criarLimitador(maximo, janelaMs) {
  const registros = new Map();

  function recentes(chave, agora) {
    const lista = (registros.get(chave) || []).filter((t) => agora - t < janelaMs);
    if (lista.length) registros.set(chave, lista);
    else registros.delete(chave);
    return lista;
  }

  return {
    excedeu: (chave, agora) => recentes(chave, agora).length >= maximo,
    registrar(chave, agora) {
      registros.set(chave, [...recentes(chave, agora), agora]);
    },
    limpar(agora) {
      for (const chave of [...registros.keys()]) recentes(chave, agora);
    },
    tamanho: () => registros.size,
  };
}

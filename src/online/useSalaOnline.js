import { useCallback, useEffect, useRef, useState } from 'react';

const CHAVE = '3palavras:vaga';
const ESPERA_DA_RESPOSTA_MS = 6000;

// Por aba: sobrevive a recarregar a página e permite retomar a mesma vaga.
function lerVaga() {
  try {
    return JSON.parse(sessionStorage.getItem(CHAVE));
  } catch {
    return null;
  }
}

function guardarVaga(vaga) {
  try {
    if (vaga) sessionStorage.setItem(CHAVE, JSON.stringify(vaga));
    else sessionStorage.removeItem(CHAVE);
  } catch {
    // Sem armazenamento: a vaga vale enquanto a página ficar aberta.
  }
}

// Quem recarrega a página durante uma partida volta direto para ela.
export function temVagaGuardada() {
  const vaga = lerVaga();
  return Boolean(vaga && vaga.codigo && vaga.token);
}

// Conversa com o servidor. A tela só desenha `sala`; quem decide tudo é o servidor.
export function useSalaOnline() {
  const [conexao, setConexao] = useState('conectando');
  const [sala, setSala] = useState(null);
  const [aviso, setAviso] = useState(null);
  const socket = useRef(null);
  const vaga = useRef(lerVaga());

  const pedir = useCallback(async (evento, dados) => {
    if (!socket.current) return { ok: false, erro: 'sem-resposta' };
    try {
      return await socket.current.timeout(ESPERA_DA_RESPOSTA_MS).emitWithAck(evento, dados);
    } catch {
      return { ok: false, erro: 'sem-resposta' };
    }
  }, []);

  const definirVaga = useCallback((nova) => {
    vaga.current = nova;
    guardarVaga(nova);
  }, []);

  useEffect(() => {
    let ativo = true;
    let aberto = null;
    // A biblioteca só é baixada por quem joga online.
    import('socket.io-client').then(({ io }) => {
      if (!ativo) return;
      aberto = io({ transports: ['websocket', 'polling'] });
      socket.current = aberto;
      aberto.on('connect', async () => {
        setConexao('conectada');
        if (!vaga.current) return;
        const resposta = await pedir('retomar', vaga.current);
        if (!resposta.ok && resposta.erro !== 'sem-resposta') {
          definirVaga(null);
          setSala(null);
          setAviso(resposta.erro);
        }
      });
      aberto.on('disconnect', () => setConexao('reconectando'));
      aberto.on('connect_error', () => setConexao((c) => (c === 'conectada' ? 'reconectando' : c === 'conectando' ? 'sem-rede' : c)));
      aberto.on('sala', setSala);
      aberto.on('sala_encerrada', () => {
        definirVaga(null);
        setSala(null);
      });
    }).catch(() => setConexao('sem-rede'));
    return () => {
      ativo = false;
      if (aberto) aberto.disconnect();
      socket.current = null;
    };
  }, [pedir, definirVaga]);

  const entrarComResposta = useCallback((resposta) => {
    if (resposta.ok) definirVaga({ codigo: resposta.codigo, token: resposta.token });
    return resposta;
  }, [definirVaga]);

  return {
    conexao,
    sala,
    aviso,
    limparAviso: () => setAviso(null),
    criar: async (nivel, personagemId) => entrarComResposta(await pedir('criar_sala', { nivel, personagemId })),
    consultar: (codigo) => pedir('consultar_sala', { codigo }),
    entrar: async (codigo, personagemId) => entrarComResposta(await pedir('entrar_sala', { codigo, personagemId })),
    comecar: () => pedir('comecar'),
    jogar: (pedido) => pedir('jogada', { pedido }),
    sair: async () => {
      definirVaga(null);
      setSala(null);
      await pedir('sair');
    },
  };
}

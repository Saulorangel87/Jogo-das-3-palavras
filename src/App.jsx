import { useEffect, useRef, useState } from 'react';
import { iniciarAudio } from './audio/motor.js';
import { lerHistorico, salvarHistorico } from './data/historico.js';
import { carregarPalavras } from './data/palavras.js';
import { FASES, aplicarAcao, criarPartida } from './logica/jogo.js';
import { montarRodada, registrarRodada } from './logica/rodada.js';
import { useSetas } from './navegacao/useNavegacao.js';
import Configuracao from './telas/Configuracao.jsx';
import Inicio from './telas/Inicio.jsx';
import Jogo from './telas/Jogo.jsx';
import Resultado from './telas/Resultado.jsx';

export default function App() {
  const [tela, setTela] = useState('inicio');
  const [partida, setPartida] = useState(null);
  const [aviso, setAviso] = useState(null);
  const ultimaConfig = useRef(null);

  useSetas();

  // Os navegadores só liberam o som depois do primeiro toque, clique ou tecla do jogador.
  useEffect(() => {
    const EVENTOS = ['click', 'keydown', 'touchstart'];
    function liberar() {
      if (iniciarAudio()) EVENTOS.forEach((e) => window.removeEventListener(e, liberar, true));
    }
    EVENTOS.forEach((e) => window.addEventListener(e, liberar, true));
    return () => EVENTOS.forEach((e) => window.removeEventListener(e, liberar, true));
  }, []);

  async function iniciar(config) {
    try {
      const temas = await carregarPalavras(config.nivel);
      ultimaConfig.current = config;
      const historico = lerHistorico(config.nivel);
      const rodada = montarRodada(temas, config.nivel, Math.random, historico);
      salvarHistorico(config.nivel, registrarRodada(historico, rodada));
      setPartida(criarPartida({ ...config, rodada }));
      setTela('jogo');
    } catch {
      setAviso('Não foi possível carregar as palavras. Tente de novo.');
      setTela('inicio');
    }
  }

  function despachar(acao) {
    setPartida((estado) => aplicarAcao(estado, acao));
  }

  if (tela === 'config') {
    return <Configuracao aoIniciar={iniciar} aoVoltar={() => setTela('inicio')} />;
  }
  if (tela === 'jogo' && partida) {
    return partida.fase === FASES.FIM ? (
      <Resultado
        estado={partida}
        aoJogarDeNovo={() => iniciar(ultimaConfig.current)}
        aoInicio={() => setTela('inicio')}
      />
    ) : (
      <Jogo estado={partida} despachar={despachar} aoSair={() => setTela('inicio')} />
    );
  }
  return (
    <Inicio
      aviso={aviso}
      aoJogar={() => {
        setAviso(null);
        setTela('config');
      }}
    />
  );
}

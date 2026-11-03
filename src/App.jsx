import { useEffect, useRef, useState } from 'react';
import { iniciarAudio } from './audio/motor.js';
import { useMusica } from './audio/useMusica.js';
import { lerHistorico, salvarHistorico } from './data/historico.js';
import { carregarPalavras } from './data/palavras.js';
import { FASES, aplicarAcao, criarPartida } from './logica/jogo.js';
import { montarRodada, registrarRodada } from './logica/rodada.js';
import { useSetas } from './navegacao/useNavegacao.js';
import Diagnostico from './componentes/Diagnostico.jsx';
import Configuracao from './telas/Configuracao.jsx';
import Inicio from './telas/Inicio.jsx';
import Jogo from './telas/Jogo.jsx';
import Resultado from './telas/Resultado.jsx';

const EVENTOS_DE_GESTO = ['click', 'keydown', 'keyup', 'mousedown', 'pointerup', 'touchstart', 'touchend'];
const COM_DIAGNOSTICO = /[?&]diag\b/.test(window.location.search);

export default function App() {
  const [tela, setTela] = useState('inicio');
  const [partida, setPartida] = useState(null);
  const [aviso, setAviso] = useState(null);
  const ultimaConfig = useRef(null);

  useSetas();
  useMusica(tela, partida);

  // Os navegadores só liberam o som depois de um gesto do jogador. Os ouvintes ficam ligados o
  // tempo todo: nem todo gesto libera (seta do controle da TV, por exemplo), e o áudio pode ser
  // suspenso de novo ao voltar de outra tela da TV. Repetir é barato quando já está tocando.
  useEffect(() => {
    const liberar = () => {
      iniciarAudio();
    };
    EVENTOS_DE_GESTO.forEach((e) => window.addEventListener(e, liberar, true));
    return () => EVENTOS_DE_GESTO.forEach((e) => window.removeEventListener(e, liberar, true));
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

  const diagnostico = COM_DIAGNOSTICO ? <Diagnostico /> : null;

  if (tela === 'config') {
    return (
      <>
        <Configuracao aoIniciar={iniciar} aoVoltar={() => setTela('inicio')} />
        {diagnostico}
      </>
    );
  }
  if (tela === 'jogo' && partida) {
    return (
      <>
        {partida.fase === FASES.FIM ? (
          <Resultado
            estado={partida}
            aoJogarDeNovo={() => iniciar(ultimaConfig.current)}
            aoInicio={() => setTela('inicio')}
          />
        ) : (
          <Jogo estado={partida} despachar={despachar} aoSair={() => setTela('inicio')} />
        )}
        {diagnostico}
      </>
    );
  }
  return (
    <>
      <Inicio
        aviso={aviso}
        aoJogar={() => {
          setAviso(null);
          setTela('config');
        }}
      />
      {diagnostico}
    </>
  );
}

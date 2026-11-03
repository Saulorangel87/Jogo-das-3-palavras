import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import { iniciarAudio } from './audio/motor.js';
import { useMusica } from './audio/useMusica.js';
import { lerHistorico, salvarHistorico } from './data/historico.js';
import { carregarPalavras } from './data/palavras.js';
import { FASES, aplicarAcao, criarPartida } from './logica/jogo.js';
import { montarRodada, registrarRodada } from './logica/rodada.js';
import { useSetas } from './navegacao/useNavegacao.js';
import Diagnostico from './componentes/Diagnostico.jsx';
import { codigoDoEndereco } from './online/mensagens.js';
import { temVagaGuardada } from './online/useSalaOnline.js';
import Configuracao from './telas/Configuracao.jsx';
import Inicio from './telas/Inicio.jsx';
import Jogo from './telas/Jogo.jsx';
import Resultado from './telas/Resultado.jsx';

// O modo online e a biblioteca de rede só são baixados por quem joga online.
const Online = lazy(() => import('./telas/Online.jsx'));
const CODIGO_DO_CONVITE = codigoDoEndereco(window.location.search);

const EVENTOS_DE_GESTO = ['click', 'keydown', 'keyup', 'mousedown', 'pointerup', 'touchstart', 'touchend'];
const COM_DIAGNOSTICO = /[?&]diag\b/.test(window.location.search);

export default function App() {
  const [tela, setTela] = useState(CODIGO_DO_CONVITE || temVagaGuardada() ? 'online' : 'inicio');
  const [partidaOnline, setPartidaOnline] = useState(null);
  const [partida, setPartida] = useState(null);
  const [aviso, setAviso] = useState(null);
  const ultimaConfig = useRef(null);

  useSetas();
  useMusica(partidaOnline ? 'jogo' : tela, partidaOnline || partida);

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
  const aoMudarPartida = useCallback((p) => setPartidaOnline(p), []);

  if (tela === 'online') {
    return (
      <>
        <Suspense fallback={<main className="tela"><h1 className="titulo">Abrindo...</h1></main>}>
          <Online
            codigoInicial={CODIGO_DO_CONVITE}
            aoMudarPartida={aoMudarPartida}
            aoVoltar={() => {
              // Sai do endereço do convite, para recarregar não abrir a sala de novo.
              window.history.replaceState(null, '', window.location.pathname);
              setTela('inicio');
            }}
          />
        </Suspense>
        {diagnostico}
      </>
    );
  }

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
        aoJogarOnline={() => {
          setAviso(null);
          setTela('online');
        }}
        aoJogar={() => {
          setAviso(null);
          setTela('config');
        }}
      />
      {diagnostico}
    </>
  );
}

import { useRef, useState } from 'react';
import { carregarPalavras } from './data/palavras.js';
import { FASES, aplicarAcao, criarPartida } from './logica/jogo.js';
import { montarRodada } from './logica/rodada.js';
import { useSetas } from './navegacao/useNavegacao.js';
import Configuracao from './telas/Configuracao.jsx';
import Inicio from './telas/Inicio.jsx';
import Jogo from './telas/Jogo.jsx';
import Resultado from './telas/Resultado.jsx';

const NIVEL = 'iniciante';

export default function App() {
  const [tela, setTela] = useState('inicio');
  const [partida, setPartida] = useState(null);
  const [aviso, setAviso] = useState(null);
  const ultimaConfig = useRef(null);

  useSetas();

  async function iniciar(config) {
    try {
      const temas = await carregarPalavras(NIVEL);
      ultimaConfig.current = config;
      setPartida(criarPartida({ ...config, rodada: montarRodada(temas) }));
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

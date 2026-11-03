import { useState } from 'react';
import { PERSONAGENS } from '../data/personagens.js';
import { MODOS } from '../logica/jogo.js';
import { useFoco, useVoltar } from '../navegacao/useNavegacao.js';
import { tocarJingle } from '../audio/motor.js';
import Personagem from '../personagens/Personagem.jsx';
import './Configuracao.css';

const NUMEROS = [2, 3, 4];
const NIVEIS = [
  { id: 'iniciante', nome: 'Iniciante', descricao: 'Palavras curtas e poucas letras' },
  { id: 'intermediario', nome: 'Intermediário', descricao: 'Palavras maiores' },
  { id: 'avancado', nome: 'Avançado', descricao: 'Frases com dica' },
];

export default function Configuracao({ aoIniciar, aoVoltar }) {
  const [modo, setModo] = useState(null);
  const [nivel, setNivel] = useState(null);
  const [total, setTotal] = useState(null);
  const [escolhidos, setEscolhidos] = useState([]);

  function voltar() {
    if (escolhidos.length > 0) setEscolhidos(escolhidos.slice(0, -1));
    else if (total) setTotal(null);
    else if (nivel) setNivel(null);
    else if (modo) setModo(null);
    else aoVoltar();
  }

  function escolher(personagem) {
    tocarJingle(personagem.id);
    const novos = [...escolhidos, personagem];
    if (novos.length === total) aoIniciar({ modo, nivel, jogadores: novos });
    else setEscolhidos(novos);
  }

  useFoco(`${modo}-${nivel}-${total}-${escolhidos.length}`);
  useVoltar(voltar);

  return (
    <main className="tela">
      {!modo && (
        <>
          <h1 className="titulo">Como vocês querem jogar?</h1>
          <div className="grade grade-2">
            <button className="botao config-opcao" data-foco-inicial onClick={() => setModo(MODOS.COMPETITIVO)}>
              Competitivo
              <small>Com roleta: quem fizer mais pontos vence</small>
            </button>
            <button className="botao config-opcao" onClick={() => setModo(MODOS.COOPERATIVO)}>
              Cooperativo
              <small>A equipe junta estrelas</small>
            </button>
          </div>
        </>
      )}

      {modo && !nivel && (
        <>
          <h1 className="titulo">Qual é o nível?</h1>
          <div className="grade grade-3-larga">
            {NIVEIS.map((n, i) => (
              <button key={n.id} className="botao config-opcao" data-foco-inicial={i === 0 ? '' : undefined} onClick={() => setNivel(n.id)}>
                {n.nome}
                <small>{n.descricao}</small>
              </button>
            ))}
          </div>
        </>
      )}

      {modo && nivel && !total && (
        <>
          <h1 className="titulo">Quantos jogadores?</h1>
          <div className="grade grade-3">
            {NUMEROS.map((n, i) => (
              <button key={n} className="botao config-numero" data-foco-inicial={i === 0 ? '' : undefined} onClick={() => setTotal(n)}>
                {n}
              </button>
            ))}
          </div>
        </>
      )}

      {modo && nivel && total && (
        <>
          <h1 className="titulo">Jogador {escolhidos.length + 1}, escolha seu personagem</h1>
          <div className="grade grade-2 grade-4-larga">
            {PERSONAGENS.map((p) => (
              <button
                key={p.id}
                className="botao config-personagem"
                disabled={escolhidos.includes(p)}
                onClick={() => escolher(p)}
              >
                <Personagem personagem={p} />
                <span>{p.nome}</span>
              </button>
            ))}
          </div>
        </>
      )}

      <button className="botao botao-secundario rodape" onClick={voltar}>Voltar</button>
    </main>
  );
}

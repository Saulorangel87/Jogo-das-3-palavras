// Sorteio da partida. Puro: o gerador de aleatórios pode ser injetado nos testes.
import { CHANCE_DE_DUAS_PALAVRAS, PAINEIS_MINIMOS_DE_DUAS_PALAVRAS } from './regras.js';
import { letrasDoTexto } from './texto.js';

const ALFABETO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
// Letras extras do iniciante: evita K, W, Y e outras raras para quem está aprendendo.
const LETRAS_COMUNS = 'ABCDEFGILMNOPRSTUV'.split('');
const EXTRAS_INICIANTE = 4;
const TOTAL_PAINEIS = 3;
const ERRADAS_POR_PAINEL = 2;

function embaralhar(lista, rng) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

const temDuasPalavras = (item) => item.texto.split(' ').length === 2;

// Escolhe os painéis do tema. No avançado, garante painéis de duas palavras e dá chance a mais deles;
// o resto é sorteio comum. Depois embaralha, para a palavra dupla não cair sempre no mesmo painel.
function sortearPaineis(itens, nivel, rng) {
  const embaralhados = embaralhar(itens, rng);
  if (nivel !== 'avancado') return embaralhados.slice(0, TOTAL_PAINEIS);
  const duplas = embaralhados.filter(temDuasPalavras);
  const outras = embaralhados.filter((i) => !temDuasPalavras(i));
  const escolhidos = [];
  for (let vaga = 0; vaga < TOTAL_PAINEIS; vaga++) {
    const faltam = TOTAL_PAINEIS - vaga;
    const jaTem = escolhidos.filter(temDuasPalavras).length;
    const obrigatorio = PAINEIS_MINIMOS_DE_DUAS_PALAVRAS - jaTem >= faltam;
    const querDupla = obrigatorio || rng() < CHANCE_DE_DUAS_PALAVRAS;
    const origem = (querDupla && duplas.length > 0) || outras.length === 0 ? duplas : outras;
    escolhidos.push(origem.shift());
  }
  return embaralhar(escolhidos, rng);
}

function semelhanca(candidato, alvo) {
  const mesmaLetra = candidato.texto[0] === alvo.texto[0] ? 2 : 0;
  const mesmoTamanho = candidato.texto.length === alvo.texto.length ? 1 : 0;
  const mesmoTema = candidato.tema === alvo.tema ? 1 : 0;
  return mesmaLetra + mesmoTamanho + mesmoTema;
}

// Opções erradas vêm de fora da partida, para um painel não entregar outro.
function escolherErradas(alvo, candidatos, rng) {
  return embaralhar(candidatos, rng)
    .sort((a, b) => semelhanca(b, alvo) - semelhanca(a, alvo))
    .slice(0, ERRADAS_POR_PAINEL)
    .map((c) => c.texto);
}

function montarTeclado(texto, nivel, rng) {
  if (nivel !== 'iniciante') return ALFABETO;
  const certas = Array.from(new Set(letrasDoTexto(texto)));
  const extras = embaralhar(
    LETRAS_COMUNS.filter((l) => !certas.includes(l)),
    rng,
  ).slice(0, EXTRAS_INICIANTE);
  return [...certas, ...extras].sort();
}

export const HISTORICO_VAZIO = { jogadas: [], ultimoTema: null };

// Temas que ainda têm itens suficientes sem repetir o que já saiu em partidas anteriores.
function temasDisponiveis(temas, jogadas) {
  return temas
    .map((t) => ({ ...t, itens: t.itens.filter((i) => !jogadas.has(i.texto)) }))
    .filter((t) => t.itens.length >= TOTAL_PAINEIS);
}

// `historico` vem de fora (o módulo é puro): o que já foi jogado neste nível e o último tema.
// Enquanto houver tema com itens novos, nada repete; quando acaba, o histórico recomeça.
export function montarRodada(temas, nivel, rng = Math.random, historico = HISTORICO_VAZIO) {
  let disponiveis = temasDisponiveis(temas, new Set(historico.jogadas));
  const reinicio = disponiveis.length === 0;
  if (reinicio) disponiveis = temasDisponiveis(temas, new Set());
  // Evita cair no mesmo tema da partida anterior, se houver outro.
  const outros = disponiveis.filter((t) => t.tema !== historico.ultimoTema);
  const opcoesDeTema = outros.length > 0 ? outros : disponiveis;
  const tema = opcoesDeTema[Math.floor(rng() * opcoesDeTema.length)];
  const sorteados = sortearPaineis(tema.itens, nivel, rng);
  const naPartida = new Set(sorteados.map((i) => i.texto));
  const candidatos = temas
    .flatMap((t) => t.itens.map((i) => ({ ...i, tema: t.tema })))
    .filter((i) => !naPartida.has(i.texto));

  return {
    tema: tema.tema,
    reinicio,
    paineis: sorteados.map((item) => ({
      ...item,
      letras: montarTeclado(item.texto, nivel, rng),
      // Só o iniciante tem opções: nos outros níveis elas deixariam a resposta óbvia.
      opcoes:
        nivel === 'iniciante'
          ? embaralhar(
              [item.texto, ...escolherErradas({ ...item, tema: tema.tema }, candidatos, rng)],
              rng,
            )
          : null,
    })),
  };
}

// Novo histórico depois de montar uma rodada.
export function registrarRodada(historico, rodada) {
  const anteriores = rodada.reinicio ? [] : historico.jogadas;
  return {
    jogadas: [...anteriores, ...rodada.paineis.map((p) => p.texto)],
    ultimoTema: rodada.tema,
  };
}

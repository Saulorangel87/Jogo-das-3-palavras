// Todos os números das regras num lugar só. Para ajustar o jogo depois de
// testar com crianças, mude aqui; nada mais precisa ser tocado.
// JavaScript puro, sem React nem window: o servidor online reutiliza este arquivo.

// Valores das fatias da roleta (competitivo). Sem fatia que tire pontos.
export const FATIAS_ROLETA = [10, 25, 5, 30, 15, 50, 20, 40];

// Resolver certo: pontos por casa ainda fechada (× multiplicador do painel).
// Perto da média da roleta (24), mas sem o risco de errar a letra e perder a vez.
export const PONTOS_POR_CASA_FECHADA = 20;

// Multiplicador de cada painel, na ordem. O 3º pode virar o jogo.
export const MULTIPLICADORES_DOS_PAINEIS = [1, 2, 3];

// Competitivo: tempo de cada vez, em segundos. Acabou, a vez passa, sem perder pontos.
// O relógio reinicia quando a pessoa acerta uma letra e continua; girar a roleta não reinicia.
export const TEMPO_DA_VEZ_S = 30;

// Avançado: painéis de exatamente duas palavras (compostas ou não, como GUARDA CHUVA ou BOLA AZUL).
// Cada partida tem pelo menos este tanto deles, se o tema tiver, e as outras vagas
// sorteiam uma palavra dupla nesta chance (0 a 1). Frases maiores ocupam o resto.
export const PAINEIS_MINIMOS_DE_DUAS_PALAVRAS = 1;
export const CHANCE_DE_DUAS_PALAVRAS = 0.5;

// Cooperativo: estrelas por painel conforme os erros da equipe
// (letra errada ou resolver errado). Do melhor para o pior.
export const ESTRELAS_POR_ERROS = [
  { ateErros: 2, estrelas: 3 },
  { ateErros: 4, estrelas: 2 },
];
export const ESTRELAS_MINIMAS = 1;
export const ESTRELAS_MAXIMAS_POR_PAINEL = 3;

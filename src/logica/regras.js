// Todos os números das regras num lugar só. Para ajustar o jogo depois de
// testar com crianças, mude aqui; nada mais precisa ser tocado.
// JavaScript puro, sem React nem window: o servidor online reutiliza este arquivo.

// Fatias da roleta (competitivo), na ordem em que aparecem girando no sentido horário.
// Ninguém perde pontos: nenhuma fatia tira pontos de ninguém. `peso` é a largura da fatia em
// relação às outras (padrão 1): uma fatia mais estreita sai menos. A primeira e a última devem valer pontos.
//   pontos       letra certa vale `valor` por casa aberta (a de 100 é a rara)
//   bonus        a próxima letra certa vale em dobro (fica marcado ao lado do jogador até usar); gira de novo
//   giro-extra   gira de novo sem gastar a vez
//   letra-gratis abre uma letra aleatória do painel e paga por ela; gira de novo
//   escudo       a próxima letra errada não passa a vez (um por jogador); gira de novo
//   soneca       a vez passa para o próximo, sem perder pontos
export const TIPOS_DE_FATIA = {
  PONTOS: 'pontos',
  BONUS: 'bonus',
  GIRO_EXTRA: 'giro-extra',
  LETRA_GRATIS: 'letra-gratis',
  ESCUDO: 'escudo',
  SONECA: 'soneca',
};
export const FATIAS_ROLETA = [
  { tipo: TIPOS_DE_FATIA.PONTOS, valor: 10 },
  { tipo: TIPOS_DE_FATIA.BONUS },
  { tipo: TIPOS_DE_FATIA.PONTOS, valor: 25 },
  { tipo: TIPOS_DE_FATIA.GIRO_EXTRA },
  { tipo: TIPOS_DE_FATIA.PONTOS, valor: 5 },
  { tipo: TIPOS_DE_FATIA.PONTOS, valor: 30 },
  { tipo: TIPOS_DE_FATIA.LETRA_GRATIS },
  { tipo: TIPOS_DE_FATIA.PONTOS, valor: 100, peso: 0.5, jackpot: true },
  { tipo: TIPOS_DE_FATIA.PONTOS, valor: 15 },
  { tipo: TIPOS_DE_FATIA.ESCUDO },
  { tipo: TIPOS_DE_FATIA.PONTOS, valor: 50 },
  { tipo: TIPOS_DE_FATIA.SONECA, peso: 0.7 },
  { tipo: TIPOS_DE_FATIA.PONTOS, valor: 20 },
  { tipo: TIPOS_DE_FATIA.PONTOS, valor: 40 },
];

// Quanto a próxima letra certa vale com o bônus ligado.
export const MULTIPLICADOR_DO_BONUS = 2;
// Valor por casa aberta da letra grátis (perto da média das fatias de pontos).
export const VALOR_DA_LETRA_GRATIS = 20;

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

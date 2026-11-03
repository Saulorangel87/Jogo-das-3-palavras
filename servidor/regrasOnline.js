// Todos os números do modo online num lugar só, como em src/logica/regras.js.
export const MIN_JOGADORES = 2;
export const MAX_JOGADORES = 4;

export const VAGA_GUARDADA_MS = 2 * 60 * 1000; // quem caiu mantém a vaga por este tempo
export const ESPERA_NA_VEZ_MS = 60 * 1000; // quem caiu na própria vez: depois disto, a vez passa
export const SALA_PARADA_MS = 30 * 60 * 1000; // sala sem nenhuma jogada é apagada
export const RESULTADO_VISIVEL_MS = 2 * 60 * 1000; // sala terminada some depois disto

export const MAX_SALAS = 200;
export const LIMITE_CODIGOS_ERRADOS = 10; // por endereço, na janela abaixo
export const LIMITE_SALAS_CRIADAS = 5; // por endereço, na janela abaixo
export const JANELA_DE_LIMITE_MS = 60 * 1000;
export const MAX_EVENTOS_POR_SEGUNDO = 20; // por conexão

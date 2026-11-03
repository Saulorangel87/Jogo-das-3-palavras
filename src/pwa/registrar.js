// Liga o modo sem internet. Se o navegador (ou a TV) não suportar ou falhar,
// o jogo continua funcionando normalmente online.
export function registrarServiceWorker(ambiente = globalThis) {
  const navegador = ambiente.navigator;
  if (!navegador || !navegador.serviceWorker) return false;
  ambiente.addEventListener('load', () => {
    navegador.serviceWorker.register('/sw.js').catch(() => {});
  });
  return true;
}

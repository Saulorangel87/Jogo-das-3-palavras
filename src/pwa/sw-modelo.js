// Service worker do jogo: guarda os arquivos para jogar sem internet.
// Modelo: o build preenche a versão e a lista de arquivos (ver pluginServiceWorker.js).
// Escrito em JavaScript simples porque também roda em navegador de TV antiga.
var VERSAO = '__VERSAO__';
var ARQUIVOS = __ARQUIVOS__;
var PREFIXO = '3palavras-';
var CACHE = PREFIXO + VERSAO;
var ESPERA_DA_REDE_MS = 3000;

self.addEventListener('install', function (evento) {
  evento.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(ARQUIVOS);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

// Mantém também o cache anterior: uma aba aberta na versão antiga ainda pode
// pedir arquivos dela (os níveis são carregados só quando escolhidos).
self.addEventListener('activate', function (evento) {
  evento.waitUntil(
    caches.keys().then(function (nomes) {
      var nossos = nomes.filter(function (nome) {
        return nome.indexOf(PREFIXO) === 0 && nome !== CACHE;
      });
      var velhos = nossos.slice(0, Math.max(0, nossos.length - 1));
      return Promise.all(velhos.map(function (nome) {
        return caches.delete(nome);
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

function comEspera(promessa, ms) {
  return new Promise(function (resolver, rejeitar) {
    var relogio = setTimeout(function () {
      rejeitar(new Error('rede lenta'));
    }, ms);
    promessa.then(function (resposta) {
      clearTimeout(relogio);
      resolver(resposta);
    }, function (erro) {
      clearTimeout(relogio);
      rejeitar(erro);
    });
  });
}

// A página tenta a rede primeiro, para pegar versão nova; sem rede, usa a guardada.
function responderPagina(pedido) {
  return comEspera(fetch(pedido), ESPERA_DA_REDE_MS).catch(function () {
    return caches.open(CACHE).then(function (cache) {
      return cache.match('/index.html');
    }).then(function (guardada) {
      return guardada || Response.error();
    });
  });
}

// Os outros arquivos têm hash no nome e não mudam: primeiro o que está guardado.
function responderArquivo(pedido) {
  return caches.match(pedido).then(function (guardada) {
    return guardada || fetch(pedido);
  });
}

self.addEventListener('fetch', function (evento) {
  var pedido = evento.request;
  if (pedido.method !== 'GET') return;
  if (new URL(pedido.url).origin !== self.location.origin) return;
  evento.respondWith(pedido.mode === 'navigate' ? responderPagina(pedido) : responderArquivo(pedido));
});

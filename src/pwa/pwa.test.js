import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { arquivosParaGuardar, calcularVersao, montarServiceWorker } from './pluginServiceWorker.js';
import { registrarServiceWorker } from './registrar.js';

const modelo = readFileSync(new URL('./sw-modelo.js', import.meta.url), 'utf-8');

describe('service worker gerado', () => {
  it('guarda tudo menos ele mesmo, em ordem estável', () => {
    expect(arquivosParaGuardar(['/sw.js', '/index.html', '/assets/a.js'])).toEqual(['/assets/a.js', '/index.html']);
  });

  it('a versão muda quando o conteúdo de um arquivo muda', () => {
    const v1 = calcularVersao(['/a.js'], () => 'um');
    expect(v1).toBe(calcularVersao(['/a.js'], () => 'um'));
    expect(v1).not.toBe(calcularVersao(['/a.js'], () => 'dois'));
  });

  it('guarda os arquivos direto do servidor, sem a cópia do cache do navegador', () => {
    expect(modelo).toContain("cache: 'reload'");
  });

  it('o modelo vira um script válido, sem marcadores sobrando', () => {
    const codigo = montarServiceWorker(modelo, ['/index.html'], 'abc123');
    expect(codigo).not.toContain('__VERSAO__');
    expect(codigo).not.toContain('__ARQUIVOS__');
    expect(codigo).toContain('["/index.html"]');
    expect(() => new Function(codigo)).not.toThrow();
  });
});

describe('registrarServiceWorker', () => {
  it('não faz nada em navegador sem suporte', () => {
    expect(registrarServiceWorker({ navigator: {}, addEventListener() {} })).toBe(false);
  });

  it('registra só depois de a página carregar e engole falha', async () => {
    let aoCarregar;
    const pedidos = [];
    const ambiente = {
      navigator: { serviceWorker: { register: (u) => { pedidos.push(u); return Promise.reject(new Error('x')); } } },
      addEventListener: (_nome, fn) => { aoCarregar = fn; },
    };
    expect(registrarServiceWorker(ambiente)).toBe(true);
    expect(pedidos).toEqual([]);
    aoCarregar();
    expect(pedidos).toEqual(['/sw.js']);
  });
});

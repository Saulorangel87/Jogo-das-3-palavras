import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';
import pluginServiceWorker from './src/pwa/pluginServiceWorker.js';

export default defineConfig({
  plugins: [
    react(),
    // Chromium 57 cobre Smart TVs antigas e é a primeira versão com CSS Grid.
    legacy({ targets: ['chrome >= 57'] }),
    // Gera o sw.js no fim do build, com a lista de arquivos para jogar sem internet.
    pluginServiceWorker(),
  ],
  server: {
    // Em desenvolvimento: `PORTA=3000 ORIGENS=http://localhost:5180 node servidor/principal.js`.
    proxy: { '/socket.io': { target: 'http://127.0.0.1:3000', ws: true } },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.js', 'servidor/**/*.test.js'],
    exclude: ['**/node_modules/**'],
  },
});

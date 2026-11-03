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
  test: {
    environment: 'node',
    include: ['src/**/*.test.js', 'servidor/**/*.test.js'],
    exclude: ['**/node_modules/**'],
  },
});

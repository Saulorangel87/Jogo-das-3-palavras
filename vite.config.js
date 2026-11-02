import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
  plugins: [
    react(),
    // Chromium 57 cobre Smart TVs antigas e é a primeira versão com CSS Grid.
    legacy({ targets: ['chrome >= 57'] }),
  ],
  test: {
    environment: 'node',
    include: ['src/**/*.test.js'],
  },
});

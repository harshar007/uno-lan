import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@stack-uno/game-engine': path.resolve(__dirname, './src/game-engine/index.ts'),
      '@': path.resolve(__dirname, './src'),
    },
  },
});

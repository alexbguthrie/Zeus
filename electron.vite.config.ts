import { defineConfig } from 'electron-vite';
import { resolve } from 'node:path';
import { rendererConfig } from './vite.renderer.config';

export default defineConfig({
  main: {},
  preload: {
    build: {
      rollupOptions: {
        input: {
          index: resolve('src/preload/index.ts'),
          'application-preload': resolve('src/preload/application-preload.ts'),
          'image-tool-preload': resolve('src/preload/image-tool-preload.ts'),
        },
        output: { format: 'cjs', entryFileNames: '[name].cjs' },
      },
    },
  },
  renderer: rendererConfig,
});

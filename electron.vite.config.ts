import { defineConfig } from 'electron-vite';
import { resolve } from 'node:path';
import { rendererConfig } from './vite.renderer.config';

export default defineConfig({
  main: {},
  preload: {
    build: {
      rollupOptions: {
        input: {
          launcher: resolve('src/preload/launcher.ts'),
          application: resolve('src/preload/application.ts'),
          'image-tool': resolve('src/preload/image-tool.ts'),
        },
        output: { format: 'cjs', entryFileNames: '[name].cjs' },
      },
    },
  },
  renderer: rendererConfig,
});

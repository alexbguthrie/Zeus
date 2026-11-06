import { defineConfig } from 'electron-vite';
import { rendererPlugins } from './vite.renderer.config';

export default defineConfig({
  main: {},
  preload: {
    build: { rollupOptions: { output: { format: 'cjs', entryFileNames: 'index.cjs' } } },
  },
  renderer: { plugins: rendererPlugins() },
});

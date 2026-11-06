import { defineConfig, type PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export function rendererPlugins(): PluginOption[] {
  return [
    react(),
    {
      name: 'zeus-development-csp',
      apply: 'serve',
      // React Fast Refresh injects an inline preamble during development.
      transformIndexHtml: (html) =>
        html.replace("script-src 'self'", "script-src 'self' 'unsafe-inline'"),
    },
  ];
}

export const rendererConfig = defineConfig({
  root: 'src/renderer',
  base: './',
  publicDir: 'assets',
  plugins: rendererPlugins(),
  build: {
    rollupOptions: {
      input: {
        launcher: resolve('src/renderer/index.html'),
        mockAI: resolve('src/renderer/applications/mock-ai/index.html'),
        resizeImage: resolve('src/renderer/tools/resize-image/index.html'),
      },
    },
  },
});

export default rendererConfig;

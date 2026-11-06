import { defineConfig, type PluginOption } from 'vite';
import react from '@vitejs/plugin-react';

export function rendererPlugins(): PluginOption[] {
  return [
    react(),
    {
      name: 'zeus-development-csp',
      apply: 'serve',
      // React Fast Refresh injects an inline preamble during development.
      transformIndexHtml: (html) => html.replace("script-src 'self'", "script-src 'self' 'unsafe-inline'"),
    },
  ];
}

export default defineConfig({
  root: 'src/renderer',
  plugins: rendererPlugins(),
});

import { existsSync } from 'node:fs';
import path from 'node:path';
import { afterEach, expect, it, vi } from 'vitest';
import { trayIconPath } from '../../src/main/renderer-pages';

const { app } = vi.hoisted(() => ({ app: { isPackaged: false } }));
vi.mock('electron', () => ({ app }));
const project = path.resolve(import.meta.dirname, '../..');
const compiledMain = path.join(project, 'out/main');

afterEach(() => {
  vi.unstubAllEnvs();
  app.isPackaged = false;
});

it('finds the development tray image from the compiled main directory', () => {
  vi.stubEnv('ELECTRON_RENDERER_URL', 'http://localhost:5173');
  const image = trayIconPath(compiledMain);
  expect(image).toBe(path.join(project, 'src/renderer/assets/trayTemplate.png'));
  expect(existsSync(image)).toBe(true);
  expect(existsSync(image.replace('.png', '@2x.png'))).toBe(true);
});

it('uses the copied renderer asset for production preview', () => {
  vi.stubEnv('ELECTRON_RENDERER_URL', '');
  expect(trayIconPath(compiledMain)).toBe(path.join(project, 'out/renderer/trayTemplate.png'));
});

it('ignores a development URL in a packaged app', () => {
  app.isPackaged = true;
  vi.stubEnv('ELECTRON_RENDERER_URL', 'http://localhost:5173');
  expect(trayIconPath(compiledMain)).toBe(path.join(project, 'out/renderer/trayTemplate.png'));
});

import { app, type BrowserWindow } from 'electron';
import path from 'node:path';

export function loadRenderer(window: BrowserWindow, page: string, query: Record<string, string>): Promise<void> {
  const devUrl = process.env.ELECTRON_RENDERER_URL;
  if (!app.isPackaged && devUrl) {
    const url = new URL(page, `${devUrl.replace(/\/$/, '')}/`);
    url.search = new URLSearchParams(query).toString();
    return window.loadURL(url.toString());
  }
  return window.loadFile(path.join(import.meta.dirname, '../renderer', page), { query });
}

export function trayIconPath(): string {
  return path.join(import.meta.dirname,
    !app.isPackaged && process.env.ELECTRON_RENDERER_URL
      ? '../../src/renderer/public/trayTemplate.png'
      : '../renderer/trayTemplate.png');
}

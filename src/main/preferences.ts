import { app, BrowserWindow, nativeTheme } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import type { Appearance, Preferences } from '../shared/lifecycle';

let appearance: Appearance = 'system';
export function getPreferences(): Preferences {
  return { appearance, resolvedTheme: nativeTheme.shouldUseDarkColors ? 'dark' : 'light' };
}
function broadcast() {
  const preferences = getPreferences();
  for (const window of BrowserWindow.getAllWindows()) {
    if (window.isDestroyed() || window.webContents.isDestroyed()) continue;
    window.webContents.send('beta:preferences', preferences);
    if (['Zeus AI', 'Resize Image'].includes(window.getTitle())) window.setBackgroundColor(preferences.resolvedTheme === 'dark' ? '#222222' : '#ffffff');
  }
}
export function initializePreferences() {
  try {
    const stored = JSON.parse(fs.readFileSync(path.join(app.getPath('userData'), 'beta-preferences.json'), 'utf8'));
    if (['system', 'light', 'dark'].includes(stored.appearance)) appearance = stored.appearance;
  } catch { /* A first launch or invalid file uses the system appearance. */ }
  nativeTheme.themeSource = appearance;
  nativeTheme.on('updated', broadcast);
}
export function setAppearance(value: unknown): Preferences {
  if (value !== 'light' && value !== 'dark' && value !== 'system') throw new Error('Invalid appearance.');
  const filename = path.join(app.getPath('userData'), 'beta-preferences.json');
  fs.mkdirSync(path.dirname(filename), { recursive: true });
  fs.writeFileSync(`${filename}.tmp`, JSON.stringify({ appearance: value }), 'utf8');
  fs.renameSync(`${filename}.tmp`, filename);
  appearance = value;
  nativeTheme.themeSource = appearance;
  broadcast();
  return getPreferences();
}

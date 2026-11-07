import { app, BrowserWindow, nativeTheme } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import type { Appearance } from '../shared/appearance';
import type { Preferences } from '../shared/preferences';
import { DEFAULT_PINNED_LAYOUT, isPinnedLayout, type PinnedLayout } from '../shared/pinned';

let appearance: Appearance = 'system';
let pinnedLayout: PinnedLayout = DEFAULT_PINNED_LAYOUT;
export function getPreferences(): Preferences {
  return {
    appearance,
    resolvedTheme: nativeTheme.shouldUseDarkColors ? 'dark' : 'light',
    pinnedLayout,
  };
}
function broadcast() {
  const preferences = getPreferences();
  for (const window of BrowserWindow.getAllWindows()) {
    if (window.isDestroyed() || window.webContents.isDestroyed()) continue;
    window.webContents.send('zeus:preferences', preferences);
    if (['Zeus AI', 'Resize Image'].includes(window.getTitle()))
      window.setBackgroundColor(preferences.resolvedTheme === 'dark' ? '#222222' : '#ffffff');
  }
}
function save(nextAppearance: Appearance, nextLayout: PinnedLayout) {
  const filename = path.join(app.getPath('userData'), 'beta-preferences.json');
  fs.mkdirSync(path.dirname(filename), { recursive: true });
  fs.writeFileSync(
    `${filename}.tmp`,
    JSON.stringify({ appearance: nextAppearance, pinnedLayout: nextLayout }),
    'utf8',
  );
  fs.renameSync(`${filename}.tmp`, filename);
}
export function initializePreferences() {
  appearance = 'system';
  pinnedLayout = DEFAULT_PINNED_LAYOUT;
  try {
    const stored = JSON.parse(
      fs.readFileSync(path.join(app.getPath('userData'), 'beta-preferences.json'), 'utf8'),
    );
    if (stored && ['system', 'light', 'dark'].includes(stored.appearance))
      appearance = stored.appearance;
    if (stored && isPinnedLayout(stored.pinnedLayout)) pinnedLayout = stored.pinnedLayout;
  } catch {
    /* Existing appearance-only files and first launches use the default layout. */
  }
  nativeTheme.themeSource = appearance;
  nativeTheme.on('updated', broadcast);
}
export function setAppearance(value: unknown): Preferences {
  if (value !== 'light' && value !== 'dark' && value !== 'system')
    throw new Error('Invalid appearance.');
  save(value, pinnedLayout);
  appearance = value;
  nativeTheme.themeSource = value;
  broadcast();
  return getPreferences();
}
export function setPinnedLayout(value: unknown): Preferences {
  if (!isPinnedLayout(value)) throw new Error('Invalid pinned layout.');
  save(appearance, value);
  pinnedLayout = value;
  broadcast();
  return getPreferences();
}

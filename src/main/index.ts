import { app } from 'electron';
import path from 'node:path';
import { createLauncherWindow } from './launcher-window';
import { registerIpc } from './ipc';
import { createTray } from './tray';
import { getPreferences, initializePreferences } from './preferences';
import { loadRenderer } from './renderer-pages';

// Keep the existing storage identifiers so notes and preferences survive the cleanup.
if (!app.commandLine.hasSwitch('user-data-dir')) {
  app.setPath('userData', path.join(app.getPath('appData'), 'Zeus Toolbelt Beta'));
}

let launcher: ReturnType<typeof createLauncherWindow> | undefined;
let tray: ReturnType<typeof createTray> | undefined;

void app
  .whenReady()
  .then(async () => {
    app.setName('Zeus');
    initializePreferences();
    if (process.platform === 'darwin') app.setActivationPolicy('accessory');

    launcher = createLauncherWindow();
    registerIpc(launcher);
    await loadRenderer(launcher.window, 'index.html', {
      native: '1',
      theme: getPreferences().resolvedTheme,
    });
    tray = createTray(launcher);
  })
  .catch((error) => {
    console.error(error);
    app.quit();
  });

app.on('before-quit', () => launcher?.dispose());
app.on('will-quit', () => tray?.dispose());

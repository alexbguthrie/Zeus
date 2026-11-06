import { app, globalShortcut, Menu, nativeImage, Tray } from 'electron';
import { trayIconPath } from './renderer-pages';
import type { LauncherWindow } from './launcher-window';

export function createTray(launcher: LauncherWindow) {
  const { window } = launcher;
  const trayIcon = nativeImage.createFromPath(trayIconPath());
  trayIcon.setTemplateImage(true);
  const tray = new Tray(trayIcon);
  tray.setToolTip('Zeus');
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: 'Show Zeus', click: () => launcher.show('launcher') },
      { label: 'Pin bar to top right', click: () => launcher.show('pinned') },
      { label: 'Settings…', click: () => launcher.show('settings') },
      { type: 'separator' },
      { label: 'Quit Zeus', click: () => app.quit() },
    ]),
  );
  const registered = globalShortcut.register('CommandOrControl+/', () => {
    if (launcher.getState().mode === 'launcher' && window.isVisible() && window.isFocused())
      launcher.hide();
    else launcher.show('launcher');
  });
  if (!registered)
    console.error(
      '⌘/ is already in use. Quit the main Zeus app, or use the Zeus tray icon → Show Zeus.',
    );

  return {
    dispose() {
      globalShortcut.unregister('CommandOrControl+/');
      tray.destroy();
    },
  };
}

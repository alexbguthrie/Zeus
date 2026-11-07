import { ipcMain, type IpcMainEvent, type IpcMainInvokeEvent } from 'electron';
import type { LauncherWindow } from './launcher-window';
import { isAppWindowSender, openAppWindow } from './app-windows';
import { saveResizedImage } from './image-save';
import { getPreferences, setAppearance, setPinnedLayout } from './preferences';

/** Register approved operations and validate the sending window at this boundary. */
export function registerIpc(launcher: LauncherWindow): void {
  const { window } = launcher;
  function trusted(event: IpcMainEvent | IpcMainInvokeEvent) {
    return (
      !window.isDestroyed() &&
      event.sender === window.webContents &&
      event.senderFrame === window.webContents.mainFrame
    );
  }
  ipcMain.handle('zeus:state', (event) => {
    if (!trusted(event)) throw new Error('Unauthorized launcher sender.');
    return launcher.getState();
  });
  ipcMain.on('zeus:prepared', (event, revision: unknown, height: unknown, width: unknown) => {
    if (
      !trusted(event) ||
      typeof revision !== 'number' ||
      !Number.isInteger(revision) ||
      typeof height !== 'number' ||
      !Number.isFinite(height) ||
      (width !== undefined && (typeof width !== 'number' || !Number.isFinite(width)))
    )
      return;
    launcher.prepared(revision, height, width);
  });
  ipcMain.handle('zeus:resize', (event, revision: unknown, height: unknown, width: unknown) => {
    if (
      !trusted(event) ||
      typeof revision !== 'number' ||
      typeof height !== 'number' ||
      !Number.isFinite(height) ||
      (width !== undefined && (typeof width !== 'number' || !Number.isFinite(width)))
    )
      return false;
    return launcher.resize(revision, height, width);
  });
  ipcMain.on('zeus:window-error', (event, revision: unknown) => {
    if (
      !trusted(event) ||
      (revision !== undefined && (typeof revision !== 'number' || !Number.isInteger(revision)))
    )
      return;
    launcher.recover(revision);
  });
  ipcMain.on('zeus:hide', (event) => {
    if (trusted(event)) launcher.hide();
  });
  ipcMain.on('zeus:pin', (event) => {
    if (trusted(event) && launcher.getState().mode === 'launcher' && launcher.getState().ready)
      launcher.show('pinned');
  });
  ipcMain.on('zeus:launcher', (event) => {
    if (trusted(event)) launcher.show('launcher');
  });
  ipcMain.on('zeus:settings', (event) => {
    if (trusted(event)) launcher.show('settings');
  });
  ipcMain.handle('zeus:get-preferences', (event) => {
    if (
      !trusted(event) &&
      !isAppWindowSender(event, 'mock-ai') &&
      !isAppWindowSender(event, 'resize-image') &&
      !isAppWindowSender(event, 'stocks')
    )
      throw new Error('Unauthorized preferences request.');
    return getPreferences();
  });
  ipcMain.handle('zeus:set-appearance', (event, appearance: unknown) => {
    if (!trusted(event)) throw new Error('Unauthorized preferences update.');
    return setAppearance(appearance);
  });
  ipcMain.handle('zeus:set-pinned-layout', (event, layout: unknown) => {
    if (!trusted(event)) throw new Error('Unauthorized preferences update.');
    return setPinnedLayout(layout);
  });
  ipcMain.handle('zeus:open-application', async (event, id: unknown) => {
    if (!trusted(event)) throw new Error('Unauthorized application request.');
    // App IDs select fixed local pages; renderer-supplied paths are never used.
    if (id !== 'mock-ai' && id !== 'stocks') throw new Error('Unknown application.');
    const revision = launcher.getState().revision;
    await openAppWindow(id);
    // Keep failures visible and leave a newer launcher session alone.
    if (launcher.getState().revision === revision) launcher.hide();
  });

  ipcMain.handle('zeus:save-image', saveResizedImage);
  ipcMain.handle('zeus:open-tool', async (event, id: unknown) => {
    if (!trusted(event)) throw new Error('Unauthorized tool request.');
    if (id !== 'resize-image') throw new Error('Unknown tool.');
    const revision = launcher.getState().revision;
    await openAppWindow('resize-image');
    if (launcher.getState().revision === revision) launcher.hide();
  });
}

import { loadRenderer } from './renderer-pages';
import { BrowserWindow, screen, type IpcMainInvokeEvent } from 'electron';
import path from 'node:path';
import { getPreferences } from './preferences';

let aiWindow: BrowserWindow | null = null;
let loading: Promise<void> | null = null;
export function isApplicationSender(event: IpcMainInvokeEvent) {
  return aiWindow && !aiWindow.isDestroyed() && event.sender === aiWindow.webContents && event.senderFrame === aiWindow.webContents.mainFrame;
}

export async function openMockAI() {
  if (!aiWindow || aiWindow.isDestroyed()) {
    const { workArea } = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
    const created = new BrowserWindow({
      title: 'Zeus AI',
      width: Math.min(1120, workArea.width - 40),
      height: Math.min(780, workArea.height - 40),
      minWidth: 640,
      minHeight: 480,
      show: false,
      backgroundColor: getPreferences().resolvedTheme === 'dark' ? '#222222' : '#ffffff',
      titleBarStyle: 'hiddenInset',
      autoHideMenuBar: true,
      webPreferences: { preload: path.join(import.meta.dirname, '../preload/application-preload.cjs'), nodeIntegration: false, contextIsolation: true, sandbox: true },
    });
    aiWindow = created;
    created.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
    created.webContents.on('will-navigate', (event) => event.preventDefault());
    created.on('closed', () => {
      if (aiWindow === created) { aiWindow = null; loading = null; }
    });
    loading = loadRenderer(created, 'applications/mock-ai/index.html', { native: '1', theme: getPreferences().resolvedTheme });
    try { await loading; }
    catch (error) { created.destroy(); throw error; }
  } else if (loading) {
    await loading;
  }
  if (!aiWindow || aiWindow.isDestroyed()) return;
  if (aiWindow.isMinimized()) aiWindow.restore();
  aiWindow.show();
  aiWindow.focus();
}

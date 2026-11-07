import { BrowserWindow, screen, type IpcMainInvokeEvent } from 'electron';
import path from 'node:path';
import { getPreferences } from './preferences';
import { loadRenderer } from './renderer-pages';

const appPages = {
  stocks: {
    title: 'Stocks',
    page: 'tools/stocks/index.html',
    preload: 'application',
    width: 1000,
    height: 720,
    minWidth: 620,
    minHeight: 520,
  },
  'mock-ai': {
    title: 'Zeus AI',
    page: 'applications/mock-ai/index.html',
    preload: 'application',
    width: 1120,
    height: 780,
    minWidth: 640,
    minHeight: 480,
  },
  'resize-image': {
    title: 'Resize Image',
    page: 'tools/resize-image/index.html',
    preload: 'image-tool',
    width: 900,
    height: 700,
    minWidth: 620,
    minHeight: 500,
  },
} as const;
type AppId = keyof typeof appPages;
const windows = new Map<AppId, { window: BrowserWindow; loading: Promise<void> }>();

export function isAppWindowSender(event: IpcMainInvokeEvent, id: AppId): boolean {
  const window = windows.get(id)?.window;
  return (
    !!window &&
    !window.isDestroyed() &&
    event.sender === window.webContents &&
    event.senderFrame === window.webContents.mainFrame
  );
}

export async function openAppWindow(id: AppId): Promise<void> {
  let entry = windows.get(id);
  if (!entry || entry.window.isDestroyed()) {
    const page = appPages[id];
    const { workArea } = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
    const window = new BrowserWindow({
      title: page.title,
      width: Math.min(page.width, workArea.width - 40),
      height: Math.min(page.height, workArea.height - 40),
      minWidth: page.minWidth,
      minHeight: page.minHeight,
      show: false,
      titleBarStyle: 'hiddenInset',
      autoHideMenuBar: true,
      backgroundColor: getPreferences().resolvedTheme === 'dark' ? '#222222' : '#ffffff',
      webPreferences: {
        preload: path.join(import.meta.dirname, `../preload/${page.preload}.cjs`),
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
      },
    });
    window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
    window.webContents.on('will-navigate', (event) => event.preventDefault());
    window.on('closed', () => {
      if (windows.get(id)?.window === window) windows.delete(id);
    });
    entry = {
      window,
      loading: loadRenderer(window, page.page, {
        native: '1',
        theme: getPreferences().resolvedTheme,
      }),
    };
    windows.set(id, entry);
  }
  try {
    await entry.loading;
  } catch (error) {
    entry.window.destroy();
    throw error;
  }
  if (entry.window.isDestroyed()) return;
  if (entry.window.isMinimized()) entry.window.restore();
  entry.window.show();
  entry.window.focus();
}

export function getAppWindow(id: AppId): BrowserWindow | undefined {
  return windows.get(id)?.window;
}

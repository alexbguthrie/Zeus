import { loadRenderer, trayIconPath } from './renderer-pages';
import { app, BrowserWindow, globalShortcut, ipcMain, Menu, nativeImage, screen, Tray, type IpcMainEvent, type IpcMainInvokeEvent, type Rectangle } from 'electron';
import path from 'node:path';
import type { LauncherMode, LauncherState } from '../shared/lifecycle';
import { openMockAI, isApplicationSender } from './applications';
import { openResizeImage, isToolSender, saveResizedImage } from './tool-windows';
import { getPreferences, initializePreferences, setAppearance } from './preferences';

// Retain the existing toolbelt storage location so saved beta notes survive.
if (!app.commandLine.hasSwitch('user-data-dir')) {
  app.setPath('userData', path.join(app.getPath('appData'), 'Zeus Toolbelt Beta'));
}

let window: BrowserWindow | null = null;
let tray: Tray | null = null;
let quitting = false;
let state: LauncherState = { revision: 0, mode: 'hidden', ready: false };
let moving = false;
let motion: ReturnType<typeof setInterval> | undefined;
let preparationTimeout: ReturnType<typeof setTimeout> | undefined;
let destination: Rectangle | null = null;

function trusted(event: IpcMainEvent | IpcMainInvokeEvent) {
  return window && !window.isDestroyed() && event.sender === window.webContents && event.senderFrame === window.webContents.mainFrame;
}
function publish() { window?.webContents.send('beta:state', state); }
function cancelMotion() {
  clearInterval(motion);
  clearTimeout(preparationTimeout);
  motion = undefined;
  preparationTimeout = undefined;
  moving = false;
}
function heightFor(mode: LauncherMode, height: number) {
  return Math.max(mode === 'pinned' ? 92 : 126, Math.min(620, Math.ceil(height)));
}
function boundsFor(mode: LauncherMode, height: number): Rectangle {
  const display = mode === 'pinned' && window?.isVisible()
    ? screen.getDisplayMatching(window.getBounds())
    : screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
  const area = display.workArea;
  const width = mode === 'pinned' ? 520 : 740;
  return {
    x: mode === 'pinned' ? area.x + area.width - width - 12 : Math.round(area.x + (area.width - width) / 2),
    y: mode === 'pinned' ? area.y + 12 : Math.round(area.y + area.height * 0.22),
    width,
    height: heightFor(mode, height),
  };
}

function hideLauncher() {
  if (!window || window.isDestroyed()) return;
  cancelMotion();
  state = { revision: state.revision + 1, mode: 'hidden', ready: false };
  window.hide();
  window.setOpacity(0);
  publish();
}

function begin(mode: Exclude<LauncherMode, 'hidden'>) {
  if (!window || window.isDestroyed() || quitting) return;
  if (state.mode === mode && !state.ready) return;
  cancelMotion();
  // Hide stale pixels before React resets. The renderer must acknowledge this
  // revision after layout; old preparations and resize messages are ignored.
  window.setOpacity(0);
  state = { revision: state.revision + 1, mode, ready: false };
  destination = boundsFor(mode, 126);
  publish();
  const revision = state.revision;
  preparationTimeout = setTimeout(() => {
    if (state.revision === revision && !state.ready) {
      console.error('Beta layout did not become ready; keeping the launcher hidden.');
      hideLauncher();
    }
  }, 1500);
}

function reveal(revision: number, height: number) {
  if (!window || !destination || state.mode === 'hidden' || state.ready || moving || revision !== state.revision) return;
  clearTimeout(preparationTimeout);
  const target = { ...destination, height: heightFor(state.mode, height) };
  const from = window.isVisible() ? window.getBounds() : target;
  moving = true;
  // Set the final size once while transparent. Only position/opacity animate,
  // so line wrapping and content measurements cannot fight a resize animation.
  window.setBounds({ ...from, width: target.width, height: target.height }, false);
  window.show();
  window.focus();
  const started = performance.now();
  const timer = setInterval(() => {
    // A queued tick from an older animation may only cancel its own timer.
    if (!window || window.isDestroyed() || revision !== state.revision) { clearInterval(timer); return; }
    const progress = Math.min(1, (performance.now() - started) / 220);
    const eased = 1 - Math.pow(1 - progress, 3);
    window.setPosition(Math.round(from.x + (target.x - from.x) * eased), Math.round(from.y + (target.y - from.y) * eased), false);
    window.setOpacity(Math.min(1, progress * 1.6));
    if (progress === 1) {
      cancelMotion();
      window.setBounds(target, false);
      window.setOpacity(1);
      state = { ...state, ready: true };
      if ((state.mode === 'launcher' || state.mode === 'settings') && !window.isFocused()) { hideLauncher(); return; }
      publish();
    }
  }, 16);
  motion = timer;
}

app.whenReady().then(async () => {
  app.setName('Zeus');
  initializePreferences();
  if (process.platform === 'darwin') app.setActivationPolicy('accessory');
  window = new BrowserWindow({
    width: 740, height: 126, title: 'Zeus', frame: false,
    transparent: true, backgroundColor: '#00000000', hasShadow: false,
    resizable: false, fullscreenable: false, show: false, alwaysOnTop: true,
    webPreferences: {
      preload: path.join(import.meta.dirname, '../preload/index.cjs'),
      nodeIntegration: false, contextIsolation: true, sandbox: true,
      // A hidden window still needs to acknowledge its prepared layout.
      // App-level idle timers remain explicitly suspended while hidden.
      backgroundThrottling: false,
    },
  });
  window.setOpacity(0);

  ipcMain.handle('beta:state', (event) => {
    if (!trusted(event)) throw new Error('Unauthorized beta sender.');
    return state;
  });
  ipcMain.on('beta:prepared', (event, revision: unknown, height: unknown) => {
    if (!trusted(event) || typeof revision !== 'number' || !Number.isInteger(revision) || typeof height !== 'number' || !Number.isFinite(height)) return;
    reveal(revision, height);
  });
  ipcMain.handle('beta:resize', (event, revision: unknown, height: unknown) => {
    if (!trusted(event) || revision !== state.revision || !state.ready || state.mode === 'hidden' || typeof height !== 'number' || !Number.isFinite(height)) return false;
    const nextHeight = heightFor(state.mode, height);
    if (window && window.getContentSize()[1] !== nextHeight) window.setContentSize(state.mode === 'pinned' ? 520 : 740, nextHeight);
    return true;
  });
  ipcMain.on('beta:hide', (event) => { if (trusted(event)) hideLauncher(); });
  ipcMain.on('beta:pin', (event) => { if (trusted(event) && state.mode === 'launcher' && state.ready) begin('pinned'); });
  ipcMain.on('beta:launcher', (event) => { if (trusted(event)) begin('launcher'); });
  ipcMain.on('beta:settings', (event) => { if (trusted(event)) begin('settings'); });
  ipcMain.handle('beta:get-preferences', (event) => {
    if (!trusted(event) && !isApplicationSender(event) && !isToolSender(event)) throw new Error('Unauthorized preferences request.');
    return getPreferences();
  });
  ipcMain.handle('beta:set-appearance', (event, appearance: unknown) => {
    if (!trusted(event)) throw new Error('Unauthorized preferences update.');
    return setAppearance(appearance);
  });
  ipcMain.handle('beta:open-application', async (event, id: unknown) => {
    if (!trusted(event)) throw new Error('Unauthorized application request.');
    // App IDs select fixed local pages; renderer-supplied paths are never used.
    if (id !== 'mock-ai') throw new Error('Unknown beta application.');
    hideLauncher();
    await openMockAI();
  });

  ipcMain.handle('beta:save-image', saveResizedImage);
  ipcMain.handle('beta:open-tool', async (event, id: unknown) => {
    if (!trusted(event)) throw new Error('Unauthorized tool request.');
    if (id !== 'resize-image') throw new Error('Unknown beta tool.');
    hideLauncher();
    await openResizeImage();
  });

  window.on('blur', () => {
    // A delayed blur from the previous hide must not cancel a new opening.
    // If focus really leaves during motion, reveal() checks it on completion.
    if ((state.mode === 'launcher' || state.mode === 'settings') && state.ready && !window?.isFocused()) hideLauncher();
  });
  window.on('hide', () => { if (state.mode !== 'hidden') hideLauncher(); });
  window.on('close', (event) => { if (!quitting) { event.preventDefault(); hideLauncher(); } });
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  window.webContents.on('will-navigate', (event) => event.preventDefault());

  function repositionPinned() {
    if (window && state.mode === 'pinned' && state.ready) {
      const area = screen.getDisplayMatching(window.getBounds()).workArea;
      window.setBounds({ x: area.x + area.width - 532, y: area.y + 12, width: 520, height: window.getBounds().height }, false);
    }
  }
  screen.on('display-metrics-changed', repositionPinned);
  screen.on('display-removed', repositionPinned);
  await loadRenderer(window, 'index.html', { native: '1', theme: getPreferences().resolvedTheme });

  const trayIcon = nativeImage.createFromPath(trayIconPath());
  trayIcon.setTemplateImage(true);
  tray = new Tray(trayIcon);
  tray.setToolTip('Zeus');
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Show Zeus', click: () => begin('launcher') },
    { label: 'Pin bar to top right', click: () => begin('pinned') },
    { label: 'Settings…', click: () => begin('settings') },
    { type: 'separator' },
    { label: 'Quit Zeus', click: () => app.quit() },
  ]));
  const registered = globalShortcut.register('CommandOrControl+/', () => {
    if (state.mode === 'launcher' && window?.isVisible() && window.isFocused()) hideLauncher();
    else begin('launcher');
  });
  if (!registered) console.error('⌘/ is already in use. Quit the main Zeus app, or use the Zeus tray icon → Show Zeus.');
}).catch((error) => { console.error(error); app.quit(); });

app.on('before-quit', () => { quitting = true; cancelMotion(); });
app.on('will-quit', () => { globalShortcut.unregisterAll(); tray?.destroy(); });

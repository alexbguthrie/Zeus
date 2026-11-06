import { BrowserWindow, screen, type Rectangle } from 'electron';
import path from 'node:path';
import type { LauncherMode, LauncherState } from '../shared/launcher';

/** Owns the native launcher window, transitions, and layout acknowledgements. */
export function createLauncherWindow() {
  let quitting = false;
  const window = new BrowserWindow({
    width: 740,
    height: 126,
    title: 'Zeus',
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    hasShadow: false,
    resizable: false,
    fullscreenable: false,
    show: false,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(import.meta.dirname, '../preload/launcher.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      // A hidden window still needs to acknowledge its prepared layout.
      // App-level idle timers remain explicitly suspended while hidden.
      backgroundThrottling: false,
    },
  });
  window.setOpacity(0);

  let state: LauncherState = { revision: 0, mode: 'hidden', ready: false };
  let moving = false;
  let motion: ReturnType<typeof setInterval> | undefined;
  let preparationTimeout: ReturnType<typeof setTimeout> | undefined;
  let destination: Rectangle | null = null;

  function publish() {
    window.webContents.send('zeus:state', state);
  }
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
    const display =
      mode === 'pinned' && window.isVisible()
        ? screen.getDisplayMatching(window.getBounds())
        : screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
    const area = display.workArea;
    const width = mode === 'pinned' ? 520 : 740;
    return {
      x:
        mode === 'pinned'
          ? area.x + area.width - width - 12
          : Math.round(area.x + (area.width - width) / 2),
      y: mode === 'pinned' ? area.y + 12 : Math.round(area.y + area.height * 0.22),
      width,
      height: heightFor(mode, height),
    };
  }

  function hideLauncher() {
    if (window.isDestroyed()) return;
    cancelMotion();
    state = { revision: state.revision + 1, mode: 'hidden', ready: false };
    window.hide();
    window.setOpacity(0);
    publish();
  }

  function begin(mode: Exclude<LauncherMode, 'hidden'>) {
    if (window.isDestroyed() || quitting) return;
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
        console.error('Launcher layout did not become ready; keeping the launcher hidden.');
        hideLauncher();
      }
    }, 1500);
  }

  function reveal(revision: number, height: number) {
    if (
      !destination ||
      state.mode === 'hidden' ||
      state.ready ||
      moving ||
      revision !== state.revision
    )
      return;
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
      if (window.isDestroyed() || revision !== state.revision) {
        clearInterval(timer);
        return;
      }
      const progress = Math.min(1, (performance.now() - started) / 220);
      const eased = 1 - Math.pow(1 - progress, 3);
      window.setPosition(
        Math.round(from.x + (target.x - from.x) * eased),
        Math.round(from.y + (target.y - from.y) * eased),
        false,
      );
      window.setOpacity(Math.min(1, progress * 1.6));
      if (progress === 1) {
        cancelMotion();
        window.setBounds(target, false);
        window.setOpacity(1);
        state = { ...state, ready: true };
        if ((state.mode === 'launcher' || state.mode === 'settings') && !window.isFocused()) {
          hideLauncher();
          return;
        }
        publish();
      }
    }, 16);
    motion = timer;
  }

  window.on('blur', () => {
    // A delayed blur from the previous hide must not cancel a new opening.
    // If focus really leaves during motion, reveal() checks it on completion.
    if (
      (state.mode === 'launcher' || state.mode === 'settings') &&
      state.ready &&
      !window.isFocused()
    )
      hideLauncher();
  });
  window.on('hide', () => {
    if (state.mode !== 'hidden') hideLauncher();
  });
  window.on('close', (event) => {
    if (!quitting) {
      event.preventDefault();
      hideLauncher();
    }
  });
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  window.webContents.on('will-navigate', (event) => event.preventDefault());

  function repositionPinned() {
    if (state.mode === 'pinned' && state.ready) {
      const area = screen.getDisplayMatching(window.getBounds()).workArea;
      window.setBounds(
        {
          x: area.x + area.width - 532,
          y: area.y + 12,
          width: 520,
          height: window.getBounds().height,
        },
        false,
      );
    }
  }
  screen.on('display-metrics-changed', repositionPinned);
  screen.on('display-removed', repositionPinned);

  function resize(revision: number, height: number): boolean {
    if (revision !== state.revision || !state.ready || state.mode === 'hidden') return false;
    const nextHeight = heightFor(state.mode, height);
    if (window.getContentSize()[1] !== nextHeight)
      window.setContentSize(state.mode === 'pinned' ? 520 : 740, nextHeight);
    return true;
  }

  return {
    window,
    getState: () => state,
    show: begin,
    hide: hideLauncher,
    prepared: reveal,
    resize,
    dispose() {
      quitting = true;
      cancelMotion();
      screen.removeListener('display-metrics-changed', repositionPinned);
      screen.removeListener('display-removed', repositionPinned);
    },
  };
}

export type LauncherWindow = ReturnType<typeof createLauncherWindow>;

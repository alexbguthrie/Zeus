import { contextBridge, ipcRenderer } from 'electron';
import type { BetaShell, LauncherState } from '../shared/lifecycle';

// Expose specific operations, never raw IPC or desktop access.
const shell: BetaShell = {
  getState: () => ipcRenderer.invoke('beta:state'),
  onState(callback) {
    const listener = (_event: Electron.IpcRendererEvent, state: LauncherState) => callback(state);
    ipcRenderer.on('beta:state', listener);
    return () => ipcRenderer.removeListener('beta:state', listener);
  },
  prepared: (revision, height) => ipcRenderer.send('beta:prepared', revision, height),
  resize: (revision, height) => ipcRenderer.invoke('beta:resize', revision, height),
  pin: () => ipcRenderer.send('beta:pin'),
  launcher: () => ipcRenderer.send('beta:launcher'),
  hide: () => ipcRenderer.send('beta:hide'),
  openApplication: (id) => ipcRenderer.invoke('beta:open-application', id),
  openTool: (id) => ipcRenderer.invoke('beta:open-tool', id),
  settings: () => ipcRenderer.send('beta:settings'),
  getPreferences: () => ipcRenderer.invoke('beta:get-preferences'),
  setAppearance: (appearance) => ipcRenderer.invoke('beta:set-appearance', appearance),
  onPreferences(callback) {
    const listener = (_event: Electron.IpcRendererEvent, preferences: import('../shared/lifecycle').Preferences) => callback(preferences);
    ipcRenderer.on('beta:preferences', listener);
    return () => ipcRenderer.removeListener('beta:preferences', listener);
  },
};
contextBridge.exposeInMainWorld('betaShell', shell);

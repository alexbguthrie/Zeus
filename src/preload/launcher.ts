import { contextBridge, ipcRenderer } from 'electron';
import type { LauncherBridge, LauncherState } from '../shared/launcher';

// Expose specific operations, never raw IPC or desktop access.
const shell: LauncherBridge = {
  getState: () => ipcRenderer.invoke('zeus:state'),
  onState(callback) {
    const listener = (_event: Electron.IpcRendererEvent, state: LauncherState) => callback(state);
    ipcRenderer.on('zeus:state', listener);
    return () => ipcRenderer.removeListener('zeus:state', listener);
  },
  prepared: (revision, height) => ipcRenderer.send('zeus:prepared', revision, height),
  resize: (revision, height) => ipcRenderer.invoke('zeus:resize', revision, height),
  pin: () => ipcRenderer.send('zeus:pin'),
  launcher: () => ipcRenderer.send('zeus:launcher'),
  hide: () => ipcRenderer.send('zeus:hide'),
  openApplication: (id) => ipcRenderer.invoke('zeus:open-application', id),
  openTool: (id) => ipcRenderer.invoke('zeus:open-tool', id),
  settings: () => ipcRenderer.send('zeus:settings'),
  getPreferences: () => ipcRenderer.invoke('zeus:get-preferences'),
  setAppearance: (appearance) => ipcRenderer.invoke('zeus:set-appearance', appearance),
  onPreferences(callback) {
    const listener = (
      _event: Electron.IpcRendererEvent,
      preferences: import('../shared/appearance').Preferences,
    ) => callback(preferences);
    ipcRenderer.on('zeus:preferences', listener);
    return () => ipcRenderer.removeListener('zeus:preferences', listener);
  },
};
contextBridge.exposeInMainWorld('zeusLauncher', shell);

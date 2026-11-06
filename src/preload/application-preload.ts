import { contextBridge, ipcRenderer } from 'electron';
import type { AppearanceBridge, Preferences } from '../shared/lifecycle';

// Sample apps may observe appearance, but cannot control the launcher/settings.
const appearance: AppearanceBridge = {
  getPreferences: () => ipcRenderer.invoke('beta:get-preferences'),
  onPreferences(callback) {
    const listener = (_event: Electron.IpcRendererEvent, preferences: Preferences) => callback(preferences);
    ipcRenderer.on('beta:preferences', listener);
    return () => ipcRenderer.removeListener('beta:preferences', listener);
  },
};
contextBridge.exposeInMainWorld('betaAppearance', appearance);

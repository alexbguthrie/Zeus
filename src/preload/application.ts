import { contextBridge, ipcRenderer } from 'electron';
import type { AppearanceBridge } from '../shared/appearance';
import type { Preferences } from '../shared/preferences';

// Sample apps may observe appearance, but cannot control the launcher/settings.
const appearance: AppearanceBridge = {
  getPreferences: () => ipcRenderer.invoke('zeus:get-preferences'),
  onPreferences(callback) {
    const listener = (_event: Electron.IpcRendererEvent, preferences: Preferences) =>
      callback(preferences);
    ipcRenderer.on('zeus:preferences', listener);
    return () => ipcRenderer.removeListener('zeus:preferences', listener);
  },
};
contextBridge.exposeInMainWorld('zeusAppearance', appearance);

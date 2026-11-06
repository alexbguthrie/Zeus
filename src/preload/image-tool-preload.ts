import { contextBridge, ipcRenderer } from 'electron';
import type { AppearanceBridge, Preferences, ImageToolBridge } from '../shared/lifecycle';

// Image tools observe appearance and can request a Save dialog for a new image copy.
const appearance: AppearanceBridge = {
  getPreferences: () => ipcRenderer.invoke('beta:get-preferences'),
  onPreferences(callback) {
    const listener = (_event: Electron.IpcRendererEvent, preferences: Preferences) => callback(preferences);
    ipcRenderer.on('beta:preferences', listener);
    return () => ipcRenderer.removeListener('beta:preferences', listener);
  },
};
contextBridge.exposeInMainWorld('betaAppearance', appearance);

const imageTool: ImageToolBridge = {
  saveCopy: (request) => ipcRenderer.invoke('beta:save-image', request),
};
contextBridge.exposeInMainWorld('betaImageTool', imageTool);

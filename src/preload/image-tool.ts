import { contextBridge, ipcRenderer } from 'electron';
import type { AppearanceBridge, Preferences } from '../shared/appearance';
import type { ImageToolBridge } from '../shared/image-tool';

// Image tools observe appearance and can request a Save dialog for a new image copy.
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

const imageTool: ImageToolBridge = {
  saveCopy: (request) => ipcRenderer.invoke('zeus:save-image', request),
};
contextBridge.exposeInMainWorld('zeusImageTool', imageTool);

/// <reference types="vite/client" />
import type { LauncherBridge } from '../shared/launcher';
import type { AppearanceBridge } from '../shared/appearance';
import type { ImageToolBridge } from '../shared/image-tool';

declare global {
  interface Window {
    zeusLauncher?: LauncherBridge;
    zeusAppearance?: AppearanceBridge;
    zeusImageTool?: ImageToolBridge;
  }
}

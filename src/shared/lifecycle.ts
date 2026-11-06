export type LauncherMode = 'hidden' | 'launcher' | 'pinned' | 'settings';
export type Appearance = 'system' | 'light' | 'dark';
export interface Preferences { appearance: Appearance; resolvedTheme: 'light' | 'dark'; }
export interface AppearanceBridge {
  getPreferences(): Promise<Preferences>;
  onPreferences(callback: (preferences: Preferences) => void): () => void;
}

export interface LauncherState {
  revision: number;
  mode: LauncherMode;
  ready: boolean;
}

export interface BetaShell extends AppearanceBridge {
  getState(): Promise<LauncherState>;
  onState(callback: (state: LauncherState) => void): () => void;
  prepared(revision: number, height: number): void;
  resize(revision: number, height: number): Promise<boolean>;
  pin(): void;
  launcher(): void;
  hide(): void;
  openApplication(id: string): Promise<void>;
  openTool(id: string): Promise<void>;
  settings(): void;
  setAppearance(appearance: Appearance): Promise<Preferences>;
}

export interface ImageSaveRequest {
  bytes: Uint8Array;
  name: string;
  format: 'image/png' | 'image/jpeg' | 'image/webp';
}
export interface ImageToolBridge { saveCopy(request: ImageSaveRequest): Promise<'saved' | 'cancelled'>; }

declare global {
  interface Window { betaShell?: BetaShell; betaAppearance?: AppearanceBridge; betaImageTool?: ImageToolBridge; }
}

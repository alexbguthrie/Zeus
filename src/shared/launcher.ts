import type { Appearance, AppearanceBridge, Preferences } from './appearance';

export type LauncherMode = 'hidden' | 'launcher' | 'pinned' | 'settings';
export interface LauncherState {
  revision: number;
  mode: LauncherMode;
  ready: boolean;
}

export interface LauncherBridge extends AppearanceBridge {
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

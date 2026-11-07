import type { PinnedLayout } from './pinned';
import type { Appearance, AppearanceBridge } from './appearance';
import type { Preferences } from './preferences';

export type LauncherMode = 'hidden' | 'launcher' | 'pinned' | 'settings';
export interface LauncherState {
  revision: number;
  mode: LauncherMode;
  ready: boolean;
}

export interface LauncherBridge extends AppearanceBridge {
  getState(): Promise<LauncherState>;
  onState(callback: (state: LauncherState) => void): () => void;
  prepared(revision: number, height: number, width?: number): void;
  resize(revision: number, height: number, width?: number): Promise<boolean>;
  recoverWindow(revision?: number): void;
  pin(): void;
  launcher(): void;
  hide(): void;
  openApplication(id: string): Promise<void>;
  openTool(id: string): Promise<void>;
  settings(): void;
  setPinnedLayout(layout: PinnedLayout): Promise<Preferences>;
  setAppearance(appearance: Appearance): Promise<Preferences>;
}

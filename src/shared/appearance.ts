export type Appearance = 'system' | 'light' | 'dark';
export interface Preferences {
  appearance: Appearance;
  resolvedTheme: 'light' | 'dark';
}
export interface AppearanceBridge {
  getPreferences(): Promise<Preferences>;
  onPreferences(callback: (preferences: Preferences) => void): () => void;
}

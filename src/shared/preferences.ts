import type { Appearance } from './appearance';
import type { PinnedLayout } from './pinned';

export interface Preferences {
  appearance: Appearance;
  resolvedTheme: 'light' | 'dark';
  pinnedLayout: PinnedLayout;
}

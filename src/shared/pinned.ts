export type ToolPresentation = 'compact' | 'inline';

// Layouts describe the workspace; tools declare which presentations they support.
export const pinnedLayouts = {
  dock: {
    title: 'Micro dock',
    description: 'A small dock with a tool below.',
    presentation: 'compact',
    collapsedWidth: 178,
    expandedWidth: 242,
    chromeWidth: 2,
    maxOpenTools: 1,
  },
  rail: {
    title: 'Side rail',
    description: 'Vertical icons with a tool alongside.',
    presentation: 'compact',
    collapsedWidth: 42,
    expandedWidth: 266,
    chromeWidth: 42,
    maxOpenTools: 1,
  },
  strip: {
    title: 'Slim bar',
    description: 'A shallow row for quick tools.',
    presentation: 'inline',
    collapsedWidth: 360,
    expandedWidth: 360,
    chromeWidth: 2,
    maxOpenTools: 1,
  },
} as const;
export type PinnedLayout = keyof typeof pinnedLayouts;
export const DEFAULT_PINNED_LAYOUT: PinnedLayout = 'strip';
export const PINNED_WINDOW_PADDING = 24;
export const DEFAULT_PINNED_WIDTH =
  pinnedLayouts[DEFAULT_PINNED_LAYOUT].collapsedWidth + PINNED_WINDOW_PADDING;
export function isPinnedLayout(value: unknown): value is PinnedLayout {
  return typeof value === 'string' && Object.hasOwn(pinnedLayouts, value);
}

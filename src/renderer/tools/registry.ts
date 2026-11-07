// Tools live here regardless of where the workspace presents them.
export const tools = [
  {
    id: 'notes',
    title: 'Notes',
    description: 'A quick note saved on this device',
    keywords: 'write text memo',
    pinned: true,
    launcher: false,
  },
  {
    id: 'timer',
    title: 'Timer',
    description: 'A small focus timer',
    keywords: 'countdown focus minutes',
    pinned: true,
    launcher: false,
  },
  {
    id: 'calculator',
    title: 'Calculator',
    description: 'Quick arithmetic',
    keywords: 'math calculate numbers',
    pinned: true,
    launcher: false,
  },
  {
    id: 'resize-image',
    title: 'Resize Image',
    description: 'Resize an image and save a new copy',
    keywords: 'photo picture dimensions scale png jpeg jpg webp',
    pinned: false,
    launcher: true,
    page: 'tools/resize-image/index.html',
  },
  // Removable example: shared by an app window and a pinned view.
  {
    id: 'stocks',
    title: 'Stocks',
    description: 'Example stock watchlist with demo quotes',
    keywords: 'ticker watchlist shares market demo',
    pinned: true,
    launcher: false,
  },
] as const;

export type Tool = (typeof tools)[number];
export type ToolId = Tool['id'];
export type PinnedTool = Extract<Tool, { pinned: true }>;
export type PinnedToolId = PinnedTool['id'];
export type LauncherTool = Extract<Tool, { launcher: true }>;
export const pinnedTools = tools.filter((tool): tool is PinnedTool => tool.pinned);
export const launcherTools = tools.filter((tool): tool is LauncherTool => tool.launcher);

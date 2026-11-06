// Launcher navigation. Apps and main tools have separate registries.
export const IDLE_DELAY_MS = 1200;

export const launcherSections = [
  { id: 'apps', title: 'Apps', hint: 'Open an app from your beta workspace', items: ['Zeus AI'] },
  { id: 'tools', title: 'Tools', hint: 'Useful developer tools for your workspace', items: [] },
  { id: 'files', title: 'Files', hint: 'Pick up where you left off', items: ['Project notes.md', 'Design references', 'Downloads', 'Documents'] },
  { id: 'actions', title: 'Actions', hint: 'A shortcut to getting things done', items: ['Capture a screenshot', 'Create a quick note', 'Toggle appearance', 'Start a timer'] },
  { id: 'clipboard', title: 'Clipboard', hint: 'Keep a useful thought close', items: ['A copied link', 'A little piece of text', 'An email address', 'A code snippet'] },
] as const;

export type LauncherSection = (typeof launcherSections)[number];

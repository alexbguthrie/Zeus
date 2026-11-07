import { beforeEach, expect, it, vi } from 'vitest';
import {
  getPreferences,
  initializePreferences,
  setAppearance,
  setPinnedLayout,
} from '../../src/main/preferences';

const store = vi.hoisted(() => ({
  text: '{}',
  temporary: '',
  theme: { themeSource: 'system', shouldUseDarkColors: false, on: vi.fn() },
}));
vi.mock('electron', () => ({
  app: { getPath: () => '/test/profile' },
  BrowserWindow: { getAllWindows: () => [] },
  nativeTheme: store.theme,
}));
vi.mock('node:fs', () => ({
  default: {
    readFileSync: () => store.text,
    mkdirSync: vi.fn(),
    writeFileSync: (_path: string, text: string) => {
      store.temporary = text;
    },
    renameSync: () => {
      store.text = store.temporary;
    },
  },
}));

beforeEach(() => {
  store.text = '{}';
  store.temporary = '';
});

it('adds the default Slim bar layout to an existing appearance-only profile', () => {
  store.text = JSON.stringify({ appearance: 'dark' });
  initializePreferences();
  expect(getPreferences()).toMatchObject({ appearance: 'dark', pinnedLayout: 'strip' });
});

it('keeps appearance and layout choices when either setting is saved', () => {
  initializePreferences();
  setPinnedLayout('rail');
  setAppearance('dark');
  expect(JSON.parse(store.text)).toEqual({ appearance: 'dark', pinnedLayout: 'rail' });
  initializePreferences();
  expect(getPreferences()).toMatchObject({ appearance: 'dark', pinnedLayout: 'rail' });
});

it.each(['unknown', '__proto__', null, 1])(
  'rejects invalid layout %s without changing the profile',
  (value) => {
    initializePreferences();
    expect(() => setPinnedLayout(value)).toThrow('Invalid pinned layout');
    expect(store.text).toBe('{}');
  },
);

it('falls back safely when a stored layout is invalid', () => {
  store.text = JSON.stringify({ appearance: 'light', pinnedLayout: 'missing-layout' });
  initializePreferences();
  expect(getPreferences()).toMatchObject({ appearance: 'light', pinnedLayout: 'strip' });
});

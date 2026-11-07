// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { usePreferences } from '../../src/renderer/settings/usePreferences';

beforeEach(() => {
  delete window.zeusLauncher;
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.unstubAllGlobals();
});

it('defaults to Slim bar while preserving an existing browser appearance choice', () => {
  localStorage.setItem('zeus.beta.appearance.v1', 'dark');
  const hook = renderHook(usePreferences);
  expect(hook.result.current.preferences).toMatchObject({
    appearance: 'dark',
    pinnedLayout: 'strip',
  });
});

it('remembers a browser layout choice after remounting without losing appearance', async () => {
  localStorage.setItem('zeus.beta.appearance.v1', 'light');
  const hook = renderHook(usePreferences);
  await act(async () => {
    await hook.result.current.setPinnedLayout('dock');
  });
  hook.unmount();
  const next = renderHook(usePreferences);
  expect(next.result.current.preferences).toMatchObject({
    appearance: 'light',
    pinnedLayout: 'dock',
  });
});

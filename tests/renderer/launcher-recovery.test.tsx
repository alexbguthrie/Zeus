// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { LauncherBridge, LauncherState } from '../../src/shared/launcher';
import Launcher from '../../src/renderer/launcher/Launcher';

let state: LauncherState;
let listener: ((next: LauncherState) => void) | undefined;
let bridge: LauncherBridge;

function emit(next: LauncherState) {
  state = next;
  act(() => listener?.(next));
}

function mount() {
  const container = document.createElement('div');
  container.id = 'root';
  document.body.append(container);
  return render(<Launcher />, { container });
}

beforeEach(() => {
  state = { revision: 1, mode: 'launcher', ready: true };
  listener = undefined;
  bridge = {
    getState: vi.fn(async () => state),
    onState: vi.fn((callback) => {
      listener = callback;
      return () => {
        listener = undefined;
      };
    }),
    prepared: vi.fn(),
    resize: vi.fn(async () => true),
    pin: vi.fn(),
    launcher: vi.fn(),
    hide: vi.fn(),
    settings: vi.fn(),
    openApplication: vi.fn(async () => {}),
    openTool: vi.fn(async () => {}),
    getPreferences: vi.fn(async () => ({ appearance: 'light', resolvedTheme: 'light' }) as const),
    setAppearance: vi.fn(async () => ({ appearance: 'light', resolvedTheme: 'light' }) as const),
    onPreferences: vi.fn(() => () => {}),
  };
  window.zeusLauncher = bridge;
  document.documentElement.dataset.native = 'true';
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
  cleanup();
  document.body.replaceChildren();
  localStorage.clear();
  delete window.zeusLauncher;
  delete document.documentElement.dataset.native;
  delete document.documentElement.dataset.pinned;
  vi.unstubAllGlobals();
});

it('shows a recoverable error when reading native state fails', async () => {
  vi.mocked(bridge.getState).mockRejectedValueOnce(new Error('IPC unavailable'));
  mount();
  expect((await screen.findByRole('alert')).textContent).toContain('Could not connect');
  fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
  await waitFor(() => expect(screen.queryByRole('alert')).toBeNull());
  await waitFor(() =>
    expect((screen.getByRole('combobox') as HTMLInputElement).disabled).toBe(false),
  );
});

it.each(['reject', 'decline'])('recovers when a layout request returns %s', async (failure) => {
  if (failure === 'reject')
    vi.mocked(bridge.resize).mockRejectedValueOnce(new Error('IPC unavailable'));
  else vi.mocked(bridge.resize).mockResolvedValueOnce(false);
  mount();
  expect((await screen.findByRole('alert')).textContent).toContain('Could not update');
  fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
  await waitFor(() => expect(screen.queryByRole('alert')).toBeNull());
  await waitFor(() =>
    expect(document.querySelector('.launcher-stack')?.getAttribute('data-layout-ready')).toBe(
      'true',
    ),
  );
  expect(vi.mocked(bridge.resize).mock.calls.length).toBeGreaterThan(1);
});

it('ignores a failed snapshot after a usable state event arrives', async () => {
  let reject!: (error: Error) => void;
  vi.mocked(bridge.getState).mockImplementationOnce(
    () =>
      new Promise((_resolve, fail) => {
        reject = fail;
      }),
  );
  mount();
  emit(state);
  await waitFor(() =>
    expect((screen.getByRole('combobox') as HTMLInputElement).disabled).toBe(false),
  );
  await act(async () => reject(new Error('Late snapshot failure')));
  expect(screen.queryByRole('alert')).toBeNull();
});

it('ignores a failed resize from an older session', async () => {
  let reject!: (error: Error) => void;
  vi.mocked(bridge.resize).mockImplementationOnce(
    () =>
      new Promise((_resolve, fail) => {
        reject = fail;
      }),
  );
  mount();
  await waitFor(() => expect(bridge.resize).toHaveBeenCalled());
  emit({ revision: 2, mode: 'launcher', ready: true });
  await waitFor(() => expect(vi.mocked(bridge.resize).mock.calls.length).toBeGreaterThan(1));
  await act(async () => reject(new Error('Old session failure')));
  expect(screen.queryByRole('alert')).toBeNull();
});

it.each([
  ['Zeus AI', 'openApplication'],
  ['Resize Image', 'openTool'],
] as const)('shows a visible error and retries opening %s', async (title, operation) => {
  vi.mocked(bridge[operation]).mockRejectedValueOnce(new Error('Internal IPC details'));
  mount();
  await waitFor(() =>
    expect((screen.getByRole('combobox') as HTMLInputElement).disabled).toBe(false),
  );
  fireEvent.change(screen.getByRole('combobox'), { target: { value: title } });
  fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Enter' });
  expect((await screen.findByRole('alert')).textContent).toContain(`Could not open ${title}`);
  expect(screen.getByRole('alert').textContent).not.toContain('Internal IPC');
  fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
  await waitFor(() => expect(screen.queryByRole('alert')).toBeNull());
  expect(bridge[operation]).toHaveBeenCalledTimes(2);
});

it('preserves pinned notes while recovering from a layout failure', async () => {
  state = { revision: 1, mode: 'pinned', ready: true };
  mount();
  fireEvent.click(await screen.findByRole('button', { name: 'Notes tool' }));
  fireEvent.change(screen.getByRole('textbox', { name: 'Quick note' }), {
    target: { value: 'Keep this note' },
  });
  await waitFor(() =>
    expect(document.querySelector('.launcher-stack')?.getAttribute('data-layout-ready')).toBe(
      'true',
    ),
  );
  vi.mocked(bridge.resize).mockRejectedValueOnce(new Error('Resize failed'));
  // JSDOM has no layout engine; supply the changed native content measurement.
  const root = document.getElementById('root')!;
  vi.spyOn(root, 'getBoundingClientRect').mockReturnValue({
    ...root.getBoundingClientRect(),
    height: 340,
  });
  fireEvent.click(screen.getByRole('button', { name: 'Timer tool' }));
  await screen.findByRole('alert');
  fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
  const note = await screen.findByRole('textbox', { name: 'Quick note' });
  expect((note as HTMLTextAreaElement).value).toBe('Keep this note');
});

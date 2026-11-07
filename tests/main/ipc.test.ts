import { beforeEach, expect, it, vi } from 'vitest';
import type { IpcMainInvokeEvent } from 'electron';
import type { LauncherWindow } from '../../src/main/launcher-window';
import { registerIpc } from '../../src/main/ipc';

const mocks = vi.hoisted(() => ({
  handle: vi.fn(),
  on: vi.fn(),
  openAppWindow: vi.fn(),
}));
vi.mock('electron', () => ({ ipcMain: { handle: mocks.handle, on: mocks.on } }));
vi.mock('../../src/main/app-windows', () => ({
  openAppWindow: mocks.openAppWindow,
  isAppWindowSender: vi.fn(() => false),
}));
vi.mock('../../src/main/image-save', () => ({ saveResizedImage: vi.fn() }));
vi.mock('../../src/main/preferences', () => ({
  getPreferences: vi.fn(),
  setAppearance: vi.fn(),
  setPinnedLayout: vi.fn(),
}));

function setup(channel: string) {
  const frame = {};
  const contents = { mainFrame: frame };
  const getState = vi.fn(() => ({ revision: 4, mode: 'launcher' as const, ready: true }));
  const hide = vi.fn();
  const launcher = {
    window: { isDestroyed: () => false, webContents: contents },
    getState,
    hide,
  } as unknown as LauncherWindow;
  registerIpc(launcher);
  const callback = mocks.handle.mock.calls.find(([name]) => name === channel)?.[1] as (
    event: IpcMainInvokeEvent,
    id: unknown,
  ) => Promise<void>;
  const event = { sender: contents, senderFrame: frame } as unknown as IpcMainInvokeEvent;
  return { callback, event, hide, getState };
}

beforeEach(() => {
  mocks.handle.mockClear();
  mocks.on.mockClear();
  mocks.openAppWindow.mockReset().mockResolvedValue(undefined);
});

it.each([
  ['zeus:open-application', 'mock-ai'],
  ['zeus:open-tool', 'resize-image'],
])('keeps the launcher visible when %s fails', async (channel, id) => {
  const { callback, event, hide } = setup(channel);
  mocks.openAppWindow.mockRejectedValueOnce(new Error('Page could not load'));
  await expect(callback(event, id)).rejects.toThrow('Page could not load');
  expect(hide).not.toHaveBeenCalled();
});

it('waits for the app to open before hiding the launcher', async () => {
  const { callback, event, hide } = setup('zeus:open-application');
  let complete!: () => void;
  mocks.openAppWindow.mockImplementationOnce(
    () =>
      new Promise<void>((resolve) => {
        complete = resolve;
      }),
  );
  const pending = callback(event, 'mock-ai');
  expect(hide).not.toHaveBeenCalled();
  complete();
  await pending;
  expect(hide).toHaveBeenCalledOnce();
});

it('does not hide a newer session when an earlier app launch finishes', async () => {
  const { callback, event, hide, getState } = setup('zeus:open-application');
  getState.mockReturnValueOnce({ revision: 4, mode: 'launcher', ready: true });
  getState.mockReturnValue({ revision: 5, mode: 'launcher', ready: true });
  await callback(event, 'mock-ai');
  expect(hide).not.toHaveBeenCalled();
});

it('rejects requests from an untrusted window', async () => {
  const { callback, event } = setup('zeus:open-application');
  await expect(
    callback({ ...event, senderFrame: {} } as IpcMainInvokeEvent, 'mock-ai'),
  ).rejects.toThrow('Unauthorized');
  expect(mocks.openAppWindow).not.toHaveBeenCalled();
});

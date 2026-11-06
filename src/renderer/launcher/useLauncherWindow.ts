import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import type { LauncherState } from '../../shared/launcher';
import type { LauncherSection } from './sections';

type Options = {
  reset(): void;
  setPinned(value: boolean): void;
  setSettingsOpen(value: boolean): void;
  setAwake(value: boolean): void;
  input: RefObject<HTMLInputElement | null>;
  lastLayout: RefObject<{ revision: number; height: number } | null>;
  idleGeneration: RefObject<number>;
  expanded: boolean;
  pickerMounted: boolean;
  active: LauncherSection | null;
  query: string;
  pinned: boolean;
  settingsOpen: boolean;
  toolLayoutVersion: number;
  launchError: string | null;
};

type WindowFailure = { kind: 'state' | 'layout'; message: string };

/** Coordinates native state revisions and measures React before the window is shown. */
export function useLauncherWindow({
  reset,
  setPinned,
  setSettingsOpen,
  setAwake,
  input,
  lastLayout,
  idleGeneration,
  expanded,
  pickerMounted,
  active,
  query,
  pinned,
  settingsOpen,
  toolLayoutVersion,
  launchError,
}: Options) {
  const [nativeState, setNativeState] = useState<LauncherState>({
    revision: -1,
    mode: 'hidden',
    ready: false,
  });
  const lifecycle = useRef(nativeState);
  const [layoutReady, setLayoutReady] = useState(!window.zeusLauncher);
  const [failure, setFailure] = useState<WindowFailure | null>(null);
  const [retryVersion, setRetryVersion] = useState(0);

  function retryWindow() {
    lastLayout.current = null;
    setFailure(null);
    setLayoutReady(!window.zeusLauncher);
    setRetryVersion((value) => value + 1);
  }

  useEffect(() => {
    const shell = window.zeusLauncher;
    if (!shell) return;
    let disposed = false;
    let receivedState = false;
    function apply(next: LauncherState) {
      if (disposed || next.revision < lifecycle.current.revision) return false;
      if (next.revision === lifecycle.current.revision && lifecycle.current.ready && !next.ready)
        return false;
      const newSession = next.revision !== lifecycle.current.revision;
      if (newSession) {
        idleGeneration.current += 1;
        reset();
        setLayoutReady(false);
      }
      lifecycle.current = next;
      setNativeState(next);
      setPinned(next.mode === 'pinned');
      setSettingsOpen(next.mode === 'settings');
      setAwake(next.mode !== 'hidden' && next.ready);
      setFailure((current) => (newSession || current?.kind === 'state' ? null : current));
      return true;
    }
    const unsubscribe = shell.onState((next) => {
      receivedState = apply(next) || receivedState;
    });
    void shell
      .getState()
      .then(apply)
      .catch(() => {
        // A newer state event can make the initial snapshot unnecessary.
        if (disposed || receivedState) return;
        setFailure({ kind: 'state', message: 'Could not connect to the Zeus window. Try again.' });
        setLayoutReady(true);
      });
    return () => {
      disposed = true;
      unsubscribe();
    };
  }, [reset, setPinned, setSettingsOpen, setAwake, idleGeneration, retryVersion]);

  useLayoutEffect(() => {
    const shell = window.zeusLauncher;
    const root = document.getElementById('root');
    if (!shell || !root || nativeState.mode === 'hidden' || failure) return;
    let cancelled = false;
    let frame = 0;
    const revision = nativeState.revision;
    function failLayout() {
      if (cancelled || lifecycle.current.revision !== revision) return;
      lastLayout.current = null;
      setFailure({ kind: 'layout', message: 'Could not update the Zeus window. Try again.' });
      // The compact recovery panel fits the last accepted window size.
      setLayoutReady(true);
    }
    if (!nativeState.ready) {
      setLayoutReady(false);
      // Two paint opportunities let React commit the reset and pinned styling.
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => {
          if (!cancelled) {
            try {
              shell.prepared(revision, root.getBoundingClientRect().height);
            } catch {
              failLayout();
            }
          }
        });
      });
    } else {
      const height = root.getBoundingClientRect().height;
      if (lastLayout.current?.revision === revision && lastLayout.current.height === height) {
        setLayoutReady(true);
        return;
      }
      setLayoutReady(false);
      void shell
        .resize(revision, height)
        .then((accepted) => {
          if (cancelled || lifecycle.current.revision !== revision) return;
          if (!accepted) {
            failLayout();
            return;
          }
          lastLayout.current = { revision, height };
          setLayoutReady(true);
          if (!expanded && !settingsOpen) input.current?.focus();
        })
        .catch(failLayout);
    }
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [
    nativeState,
    expanded,
    pickerMounted,
    active,
    query,
    pinned,
    settingsOpen,
    toolLayoutVersion,
    launchError,
    retryVersion,
    failure,
    input,
    lastLayout,
  ]);

  return { lifecycle, layoutReady, windowError: failure?.message ?? null, retryWindow };
}

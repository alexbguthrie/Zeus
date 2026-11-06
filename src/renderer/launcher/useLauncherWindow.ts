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
};

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
}: Options) {
  const [nativeState, setNativeState] = useState<LauncherState>({
    revision: -1,
    mode: 'hidden',
    ready: false,
  });
  const lifecycle = useRef(nativeState);
  const [layoutReady, setLayoutReady] = useState(!window.zeusLauncher);
  useEffect(() => {
    const shell = window.zeusLauncher;
    if (!shell) return;
    let disposed = false;
    function apply(next: LauncherState) {
      if (disposed || next.revision < lifecycle.current.revision) return;
      if (next.revision === lifecycle.current.revision && lifecycle.current.ready && !next.ready)
        return;
      if (next.revision !== lifecycle.current.revision) {
        idleGeneration.current += 1;
        reset();
        setLayoutReady(false);
      }
      lifecycle.current = next;
      setNativeState(next);
      setPinned(next.mode === 'pinned');
      setSettingsOpen(next.mode === 'settings');
      setAwake(next.mode !== 'hidden' && next.ready);
    }
    const unsubscribe = shell.onState(apply);
    void shell.getState().then(apply);
    return () => {
      disposed = true;
      unsubscribe();
    };
  }, [reset]);

  useLayoutEffect(() => {
    const shell = window.zeusLauncher;
    const root = document.getElementById('root');
    if (!shell || !root || nativeState.mode === 'hidden') return;
    let cancelled = false;
    let frame = 0;
    const revision = nativeState.revision;
    if (!nativeState.ready) {
      setLayoutReady(false);
      // Two paint opportunities let React commit the reset and pinned styling.
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => {
          if (!cancelled) shell.prepared(revision, root.getBoundingClientRect().height);
        });
      });
    } else {
      const height = root.getBoundingClientRect().height;
      if (lastLayout.current?.revision === revision && lastLayout.current.height === height) {
        setLayoutReady(true);
        return;
      }
      setLayoutReady(false);
      void shell.resize(revision, height).then((accepted) => {
        if (!cancelled && accepted && lifecycle.current.revision === revision) {
          lastLayout.current = { revision, height };
          setLayoutReady(true);
          if (!expanded && !settingsOpen) input.current?.focus();
        }
      });
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
  ]);

  return { lifecycle, layoutReady };
}

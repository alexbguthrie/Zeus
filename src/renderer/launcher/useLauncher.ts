import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { SampleApplication } from '../applications/registry';
import type { LauncherTool } from '../tools/registry';
import { IDLE_DELAY_MS, type LauncherSection } from './sections';
import { findResults, type SearchResult } from './search';
import { useLauncherWindow } from './useLauncherWindow';
import { useLauncherKeyboard } from './useLauncherKeyboard';

export function useLauncher() {
  const input = useRef<HTMLInputElement>(null);
  const [resultIndex, setResultIndex] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(
    !window.zeusLauncher && new URLSearchParams(location.search).get('view') === 'settings',
  );
  const [launching, setLaunching] = useState(false);
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [pickerMounted, setPickerMounted] = useState(false);
  const [pickerShown, setPickerShown] = useState(false);
  const pickerTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const idleSuppressed = useRef(false);
  const lastLayout = useRef<{ revision: number; height: number } | null>(null);
  const [selected, setSelected] = useState(0);
  const [active, setActive] = useState<LauncherSection | null>(null);
  const [message, setMessage] = useState('');
  const [launchFailure, setLaunchFailure] = useState<{
    result: SearchResult;
    message: string;
  } | null>(null);
  const [session, setSession] = useState(0);
  const [awake, setAwake] = useState(document.documentElement.dataset.native !== 'true');
  const [pinned, setPinned] = useState(false);
  const [toolLayoutVersion, setToolLayoutVersion] = useState(0);
  const toolsChanged = useCallback(() => setToolLayoutVersion((value) => value + 1), []);
  const idleGeneration = useRef(0);

  const cancelIdle = useCallback(() => {
    idleGeneration.current += 1;
  }, []);

  const results = useMemo(() => findResults(query, active), [active, query]);
  const selectedResult = Math.min(resultIndex, Math.max(0, results.length - 1));

  const reset = useCallback(() => {
    idleGeneration.current += 1;
    setPinned(false);
    setSettingsOpen(false);
    setResultIndex(0);
    setQuery('');
    setExpanded(false);
    clearTimeout(pickerTimer.current);
    setPickerMounted(false);
    setPickerShown(false);
    idleSuppressed.current = false;
    lastLayout.current = null;
    setSelected(0);
    setActive(null);
    setMessage('');
    setSession((value) => value + 1);
    input.current?.focus();
  }, []);

  const { lifecycle, layoutReady, windowError, retryWindow } = useLauncherWindow({
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
    launchError: launchFailure?.message ?? null,
  });

  const pin = useCallback(() => {
    idleGeneration.current += 1;
    if (window.zeusLauncher) {
      window.zeusLauncher.pin();
      return;
    }
    setPinned(true);
    setExpanded(false);
    setActive(null);
  }, []);

  const returnToLauncher = useCallback(() => {
    idleGeneration.current += 1;
    if (window.zeusLauncher) {
      window.zeusLauncher.launcher();
      return;
    }
    reset();
  }, [reset]);

  useLayoutEffect(() => {
    document.documentElement.dataset.pinned = String(pinned);
    if (awake) input.current?.focus();
  }, [pinned]);

  const openSection = useCallback((section: LauncherSection) => {
    idleGeneration.current += 1;
    setActive(section);
    setQuery('');
    setExpanded(false);
    setMessage('');
    setLaunchFailure(null);
    setResultIndex(0);
    input.current?.focus();
  }, []);

  async function launchApplication(application: SampleApplication) {
    if (launching) return;
    cancelIdle();
    setLaunching(true);
    setLaunchFailure(null);
    setMessage('');
    try {
      if (window.zeusLauncher) await window.zeusLauncher.openApplication(application.id);
      else {
        const appWindow = window.open(
          new URL(application.page, document.baseURI).href,
          'zeus-mock-ai',
          'popup,width=1120,height=780',
        );
        if (!appWindow) throw new Error('Allow the preview to open a window, then try again.');
        appWindow.opener = null;
        appWindow.focus();
      }
    } catch (error) {
      setLaunchFailure({
        result: { id: `app-${application.id}`, title: application.title, application },
        message:
          !window.zeusLauncher && error instanceof Error
            ? error.message
            : `Could not open ${application.title}. Please try again.`,
      });
    } finally {
      setLaunching(false);
    }
  }

  async function launchTool(tool: LauncherTool) {
    if (launching) return;
    cancelIdle();
    setLaunching(true);
    setLaunchFailure(null);
    setMessage('');
    try {
      if (window.zeusLauncher) await window.zeusLauncher.openTool(tool.id);
      else {
        const toolWindow = window.open(
          new URL(tool.page, document.baseURI).href,
          `zeus-tool-${tool.id}`,
          'popup,width=900,height=700',
        );
        if (!toolWindow) throw new Error('Allow the preview to open a window, then try again.');
        toolWindow.opener = null;
        toolWindow.focus();
      }
    } catch (error) {
      setLaunchFailure({
        result: { id: `tool-${tool.id}`, title: tool.title, tool },
        message:
          !window.zeusLauncher && error instanceof Error
            ? error.message
            : `Could not open ${tool.title}. Please try again.`,
      });
    } finally {
      setLaunching(false);
    }
  }

  function activateResult(result: SearchResult | undefined) {
    if (!result) return;
    if (result.application) void launchApplication(result.application);
    else if (result.tool) void launchTool(result.tool);
    else if (result.section) openSection(result.section);
    else setMessage(`${result.title} selected. This is a preview; no desktop action was run.`);
  }

  const pickerOpen = expanded && !active && !query && !pinned && !settingsOpen;
  useEffect(() => {
    let firstFrame = 0;
    let secondFrame = 0;
    clearTimeout(pickerTimer.current);
    if (pickerOpen) {
      setPickerMounted(true);
      if (layoutReady)
        firstFrame = requestAnimationFrame(() => {
          secondFrame = requestAnimationFrame(() => setPickerShown(true));
        });
    } else {
      setPickerShown(false);
      if (pinned || active || settingsOpen || !awake) setPickerMounted(false);
      else if (pickerMounted) pickerTimer.current = setTimeout(() => setPickerMounted(false), 170);
    }
    return () => {
      clearTimeout(pickerTimer.current);
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
    };
  }, [pickerOpen, layoutReady, pickerMounted, pinned, active, settingsOpen, awake]);

  useEffect(() => {
    if (!awake || idleSuppressed.current || pinned || settingsOpen || query || active || expanded)
      return;
    const generation = ++idleGeneration.current;
    const timer = window.setTimeout(() => {
      if (generation !== idleGeneration.current) return;
      if (
        window.zeusLauncher &&
        (!lifecycle.current.ready || lifecycle.current.mode !== 'launcher')
      )
        return;
      setSelected(0);
      setExpanded(true);
    }, IDLE_DELAY_MS);
    return () => {
      idleGeneration.current += 1;
      window.clearTimeout(timer);
    };
  }, [query, active, expanded, session, awake, pinned, settingsOpen]);

  function onSearchChange(value: string) {
    cancelIdle();
    setQuery(value);
    idleSuppressed.current = false;
    setExpanded(false);
    setMessage('');
    setLaunchFailure(null);
    setResultIndex(0);
  }

  const { onSearchKeyDown, onPickerKeyDown } = useLauncherKeyboard({
    input,
    lifecycle,
    idleSuppressed,
    active,
    expanded,
    query,
    pinned,
    settingsOpen,
    results,
    selectedResult,
    reset,
    returnToLauncher,
    cancelIdle,
    pin,
    openSection,
    activateResult,
    setExpanded,
    setQuery,
    setSelected,
    setResultIndex,
  });

  return {
    input,
    active,
    awake,
    query,
    results,
    selectedResult,
    launching,
    message,
    pinned,
    settingsOpen,
    layoutReady,
    pickerMounted,
    pickerShown,
    pickerOpen,
    expanded,
    selected,
    reset,
    returnToLauncher,
    toolsChanged,
    openSection,
    activateResult,
    setSelected,
    setResultIndex,
    onSearchChange,
    onSearchKeyDown,
    onPickerKeyDown,
    launchError: launchFailure?.message ?? null,
    retryLaunch: () => activateResult(launchFailure?.result),
    dismissLaunchError: () => setLaunchFailure(null),
    windowError,
    retryWindow,
  };
}

export type LauncherController = ReturnType<typeof useLauncher>;

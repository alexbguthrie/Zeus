import { useEffect, type RefObject, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import type { LauncherState } from '../../shared/launcher';
import { launcherSections, type LauncherSection } from './sections';
import type { SearchResult } from './search';

type Options = {
  input: RefObject<HTMLInputElement | null>;
  lifecycle: RefObject<LauncherState>;
  idleSuppressed: RefObject<boolean>;
  active: LauncherSection | null;
  expanded: boolean;
  query: string;
  pinned: boolean;
  settingsOpen: boolean;
  results: SearchResult[];
  selectedResult: number;
  reset(): void;
  returnToLauncher(): void;
  cancelIdle(): void;
  pin(): void;
  openSection(section: LauncherSection): void;
  activateResult(result: SearchResult | undefined): void;
  setExpanded(value: boolean): void;
  setQuery(value: string): void;
  setSelected: React.Dispatch<React.SetStateAction<number>>;
  setResultIndex: React.Dispatch<React.SetStateAction<number>>;
};

export function useLauncherKeyboard({
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
}: Options) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.isComposing) return;
      if (window.zeusLauncher && !lifecycle.current.ready) return;
      if (settingsOpen) {
        if (
          event.key === 'Escape' ||
          (event.key === 'ArrowLeft' && !(event.target instanceof HTMLInputElement))
        ) {
          event.preventDefault();
          returnToLauncher();
        }
        return;
      }
      if (
        event.key === 'ArrowLeft' &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey &&
        active &&
        (event.target !== input.current || query.length === 0)
      ) {
        event.preventDefault();
        reset();
        return;
      }
      if ((event.metaKey || event.ctrlKey) && !event.altKey) {
        const index = Number(event.key) - 1;
        if (Number.isInteger(index) && index >= 0 && index < launcherSections.length) {
          event.preventDefault();
          if (pinned) return;
          openSection(launcherSections[index]);
          return;
        }
        if (event.key === '/') {
          event.preventDefault();
          if (pinned) returnToLauncher();
          else reset();
        }
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        if (pinned) returnToLauncher();
        else if (active || query) reset();
        else if (expanded) {
          cancelIdle();
          idleSuppressed.current = true;
          setExpanded(false);
          input.current?.focus();
        } else {
          cancelIdle();
          window.zeusLauncher?.hide();
        }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [
    active,
    expanded,
    query,
    pinned,
    settingsOpen,
    openSection,
    reset,
    returnToLauncher,
    cancelIdle,
  ]);

  function onSearchKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing) return;
    if (window.zeusLauncher && !lifecycle.current.ready) return;
    if ((event.key === 'ArrowUp' || event.key === 'ArrowDown') && results.length) {
      event.preventDefault();
      setResultIndex(
        (value) => (value + (event.key === 'ArrowDown' ? 1 : -1) + results.length) % results.length,
      );
      return;
    }
    if (event.key === 'ArrowUp' && !active && !query) {
      event.preventDefault();
      pin();
      return;
    }
    if (event.key === 'ArrowDown' && !active && !query) {
      cancelIdle();
      event.preventDefault();
      setQuery('');
      setSelected(0);
      setExpanded(true);
    }
    if (event.key === 'Enter' && results.length) {
      event.preventDefault();
      activateResult(results[selectedResult]);
    }
  }
  function onPickerKeyDown(event: ReactKeyboardEvent<HTMLElement>) {
    if (event.nativeEvent.isComposing) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      const direction = event.key === 'ArrowRight' ? 1 : -1;
      setSelected(
        (value) => (value + direction + launcherSections.length) % launcherSections.length,
      );
    } else if (event.key === 'ArrowUp') {
      cancelIdle();
      idleSuppressed.current = true;
      event.preventDefault();
      setExpanded(false);
      input.current?.focus();
    } else if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
      cancelIdle();
      event.preventDefault();
      setQuery(event.key);
      setExpanded(false);
      input.current?.focus();
    }
  }
  return { onSearchKeyDown, onPickerKeyDown };
}

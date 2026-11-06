import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { IDLE_DELAY_MS, launcherSections, type LauncherSection } from './launcher-sections';
import type { LauncherState } from '../../shared/lifecycle';
import SectionIcon from './SectionIcon';
import Toolbelt from '../tools/pinned/Toolbelt';
import { applications, type SampleApplication } from '../applications/registry';
import Settings from './Settings';
import { mainTools, type MainTool } from '../tools/main/registry';
import { useAppearance } from './useAppearance';

type SearchResult = { id: string; title: string; application?: SampleApplication; tool?: MainTool; section?: LauncherSection; sample?: string };

export default function Launcher() {
  const input = useRef<HTMLInputElement>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const resultButtons = useRef<(HTMLButtonElement | null)[]>([]);
  const pointerPosition = useRef<{ x: number; y: number } | null>(null);
  const [resultIndex, setResultIndex] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(!window.betaShell && new URLSearchParams(location.search).get('view') === 'settings');
  const appearance = useAppearance();
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
  const [session, setSession] = useState(0);
  const [awake, setAwake] = useState(document.documentElement.dataset.native !== 'true');
  const [pinned, setPinned] = useState(false);
  const [toolLayoutVersion, setToolLayoutVersion] = useState(0);
  const toolsChanged = useCallback(() => setToolLayoutVersion((value) => value + 1), []);
  const [nativeState, setNativeState] = useState<LauncherState>({ revision: -1, mode: 'hidden', ready: false });
  const lifecycle = useRef(nativeState);
  const idleGeneration = useRef(0);
  const [layoutReady, setLayoutReady] = useState(!window.betaShell);

  const cancelIdle = useCallback(() => { idleGeneration.current += 1; }, []);

  useEffect(() => {
    const track = (event: MouseEvent) => { pointerPosition.current = { x: event.screenX, y: event.screenY }; };
    window.addEventListener('mousemove', track);
    return () => window.removeEventListener('mousemove', track);
  }, []);

  const results = useMemo<SearchResult[]>(() => {
    const search = query.trim().toLowerCase();
    const appResults: SearchResult[] = (active?.id === 'apps' || (!active && search)) ? applications.filter((application) =>
      `${application.title} ${application.description} ${application.keywords}`.toLowerCase().includes(search),
    ).map((application) => ({ id: `app-${application.id}`, title: application.title, application })) : [];
    const toolResults: SearchResult[] = (active?.id === 'tools' || (!active && search)) ? mainTools.filter((tool) => `${tool.title} ${tool.description} ${tool.keywords}`.toLowerCase().includes(search)).map((tool) => ({ id: `tool-${tool.id}`, title: tool.title, tool })) : [];
    if (active?.id === 'apps') return appResults;
    if (active?.id === 'tools') return toolResults;
    if (active) return active.items.filter((item) => item.toLowerCase().includes(search)).map((sample, index) => ({ id: `sample-${active.id}-${index}`, title: sample, sample }));
    if (!search) return [];
    return [...appResults, ...toolResults, ...launcherSections.filter((section) => `${section.title} ${section.items.join(' ')}`.toLowerCase().includes(search)).map((section) => ({ id: `section-${section.id}`, title: section.title, section }))];
  }, [active, query]);
  const selectedResult = Math.min(resultIndex, Math.max(0, results.length - 1));

  const reset = useCallback(() => {
    idleGeneration.current += 1;
    setPinned(false);
    setSettingsOpen(false);
    setResultIndex(0);
    setQuery('');
    setExpanded(false);
    clearTimeout(pickerTimer.current);
    setPickerMounted(false); setPickerShown(false);
    idleSuppressed.current = false;
    lastLayout.current = null;
    setSelected(0);
    setActive(null);
    setMessage('');
    setSession((value) => value + 1);
    input.current?.focus();
  }, []);

  const pin = useCallback(() => {
    idleGeneration.current += 1;
    if (window.betaShell) { window.betaShell.pin(); return; }
    setPinned(true);
    setExpanded(false);
    setActive(null);
  }, []);

  const returnToLauncher = useCallback(() => {
    idleGeneration.current += 1;
    if (window.betaShell) { window.betaShell.launcher(); return; }
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
    setResultIndex(0);
    input.current?.focus();
  }, []);

  async function launchApplication(application: SampleApplication) {
    if (launching) return;
    cancelIdle();
    setLaunching(true);
    setMessage('');
    try {
      if (window.betaShell) await window.betaShell.openApplication(application.id);
      else {
        const appWindow = window.open(new URL(application.page, document.baseURI).href, 'zeus-mock-ai', 'popup,width=1120,height=780');
        if (!appWindow) throw new Error('Allow the preview to open a window, then try again.');
        appWindow.opener = null;
        appWindow.focus();
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not open the sample app.');
    } finally { setLaunching(false); }
  }

  async function launchTool(tool: MainTool) {
    if (launching) return;
    cancelIdle(); setLaunching(true); setMessage('');
    try {
      if (window.betaShell) await window.betaShell.openTool(tool.id);
      else {
        const toolWindow = window.open(new URL(tool.page, document.baseURI).href, `zeus-tool-${tool.id}`, 'popup,width=900,height=700');
        if (!toolWindow) throw new Error('Allow the preview to open a window, then try again.');
        toolWindow.opener = null; toolWindow.focus();
      }
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not open the tool.'); }
    finally { setLaunching(false); }
  }

  function activateResult(result: SearchResult | undefined) {
    if (!result) return;
    if (result.application) void launchApplication(result.application);
    else if (result.tool) void launchTool(result.tool);
    else if (result.section) openSection(result.section);
    else setMessage(`${result.title} selected. This is a preview; no desktop action was run.`);
  }

  useEffect(() => {
    if (layoutReady) resultButtons.current[selectedResult]?.scrollIntoView({ block: 'nearest' });
  }, [selectedResult, results, layoutReady]);

  useEffect(() => {
    const shell = window.betaShell;
    if (!shell) return;
    let disposed = false;
    function apply(next: LauncherState) {
      if (disposed || next.revision < lifecycle.current.revision) return;
      if (next.revision === lifecycle.current.revision && lifecycle.current.ready && !next.ready) return;
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
    const shell = window.betaShell;
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
    return () => { cancelled = true; cancelAnimationFrame(frame); };
  }, [nativeState, expanded, pickerMounted, active, query, pinned, settingsOpen, toolLayoutVersion]);

  const pickerOpen = expanded && !active && !query && !pinned && !settingsOpen;
  useEffect(() => {
    let firstFrame = 0;
    let secondFrame = 0;
    clearTimeout(pickerTimer.current);
    if (pickerOpen) {
      setPickerMounted(true);
      if (layoutReady) firstFrame = requestAnimationFrame(() => {
        secondFrame = requestAnimationFrame(() => setPickerShown(true));
      });
    } else {
      setPickerShown(false);
      if (pinned || active || settingsOpen || !awake) setPickerMounted(false);
      else if (pickerMounted) pickerTimer.current = setTimeout(() => setPickerMounted(false), 170);
    }
    return () => { clearTimeout(pickerTimer.current); cancelAnimationFrame(firstFrame); cancelAnimationFrame(secondFrame); };
  }, [pickerOpen, layoutReady, pickerMounted, pinned, active, settingsOpen, awake]);

  useEffect(() => {
    if (!awake || idleSuppressed.current || pinned || settingsOpen || query || active || expanded) return;
    const generation = ++idleGeneration.current;
    const timer = window.setTimeout(() => {
      if (generation !== idleGeneration.current) return;
      if (window.betaShell && (!lifecycle.current.ready || lifecycle.current.mode !== 'launcher')) return;
      setSelected(0);
      setExpanded(true);
    }, IDLE_DELAY_MS);
    return () => { idleGeneration.current += 1; window.clearTimeout(timer); };
  }, [query, active, expanded, session, awake, pinned, settingsOpen]);

  useEffect(() => {
    if (expanded && pickerShown && layoutReady) buttons.current[selected]?.focus();
  }, [expanded, selected, pickerShown, layoutReady]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.isComposing) return;
      if (window.betaShell && !lifecycle.current.ready) return;
      if (settingsOpen) {
        if (event.key === 'Escape' || (event.key === 'ArrowLeft' && !(event.target instanceof HTMLInputElement))) { event.preventDefault(); returnToLauncher(); }
        return;
      }
      if (event.key === 'ArrowLeft' && !event.metaKey && !event.ctrlKey && !event.altKey && active && (event.target !== input.current || query.length === 0)) {
        event.preventDefault(); reset(); return;
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
          window.betaShell?.hide();
        }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, expanded, query, pinned, settingsOpen, openSection, reset, returnToLauncher, cancelIdle]);

  return (
    <div className="preview">
      <header className="preview-header">
        <a href="/" aria-label="Zeus toolbelt home">zeus<span> / beta</span></a>
        <button className="replay" onClick={returnToLauncher}>Replay opening <span>↻</span></button>
      </header>

      <main className="stage" aria-label="Launcher prototype">
        <div className="launcher-stack" data-layout-ready={layoutReady}>
          {!pinned && !settingsOpen && <div className="search-pill">
            {active ? <button className="back" onClick={reset} aria-label="Back to all launcher sections">←</button> : <span className="search-mark" aria-hidden="true">⌕</span>}
            <input
              ref={input}
              autoFocus
              disabled={!!window.betaShell && !awake}
              value={query}
              aria-label={active ? `Search ${active.title}` : 'Search or ask'}
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={results.length > 0}
              aria-controls={results.length ? 'search-results' : undefined}
              aria-activedescendant={results[selectedResult]?.id}
              placeholder={active ? `Search ${active.title.toLowerCase()}…` : 'Search or ask…'}
              spellCheck={false}
              autoComplete="off"
              onChange={(event) => {
                cancelIdle();
                setQuery(event.target.value);
                idleSuppressed.current = false;
                setExpanded(false);
                setMessage('');
                setResultIndex(0);
              }}
              onKeyDown={(event) => {
                if (event.nativeEvent.isComposing) return;
                if (window.betaShell && !lifecycle.current.ready) return;
                if ((event.key === 'ArrowUp' || event.key === 'ArrowDown') && results.length) {
                  event.preventDefault();
                  setResultIndex((value) => (value + (event.key === 'ArrowDown' ? 1 : -1) + results.length) % results.length);
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
              }}
            />
            <kbd className="search-shortcut" title="↑ to pin · ↓ to explore">⌘ /</kbd>
          </div>}

          <Toolbelt visible={pinned && !settingsOpen} pending={!!window.betaShell && !awake} onReturn={returnToLauncher} onLayoutChange={toolsChanged} />

          {settingsOpen && <Settings preferences={appearance.preferences} onChange={(value) => void appearance.setAppearance(value)} onBack={returnToLauncher} error={appearance.error} />}

          {pickerMounted && (
            <nav className="orbit" data-open={pickerShown} inert={!pickerShown} aria-hidden={!pickerOpen} aria-label="Launcher sections" onKeyDown={(event) => {
              if (event.nativeEvent.isComposing) return;
              if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
                event.preventDefault();
                const direction = event.key === 'ArrowRight' ? 1 : -1;
                setSelected((value) => (value + direction + launcherSections.length) % launcherSections.length);
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
            }}>
              {launcherSections.map((section, index) => (
                <button key={section.id} className="section-button" ref={(element) => { buttons.current[index] = element; }} tabIndex={index === selected ? 0 : -1} onFocus={() => setSelected(index)} onClick={() => openSection(section)} aria-label={`${section.title}, Command ${index + 1}`}>
                  <span className="section-circle"><SectionIcon id={section.id} /></span>
                  <span className="section-meta"><span className="section-name">{section.id === 'apps' ? 'Apps' : section.title}</span><kbd>⌘{index + 1}</kbd></span>
                </button>
              ))}
            </nav>
          )}

          {!pinned && !settingsOpen && (active || query) && (
            <section className="detail-panel" aria-label={active ? active.title : 'Search results'}>
              <div className="panel-heading"><div><h1>{active?.title ?? 'Search results'}</h1><p>{active?.hint ?? 'Apps and launcher sections in your workspace'}</p></div><span className="preview-badge">{active?.id === 'apps' ? 'Local app' : 'Beta'}</span></div>
              <div className="sample-list" id="search-results" role="listbox" aria-label="Search results">
                {results.map((result, index) => <button className={`search-result ${(result.application || result.tool) ? 'application-row' : ''} ${index === selectedResult ? 'is-selected' : ''}`} id={result.id} role="option" aria-selected={index === selectedResult} tabIndex={-1} key={result.id} ref={(element) => { resultButtons.current[index] = element; }} disabled={launching} onMouseDown={(event) => event.preventDefault()} onMouseMove={(event) => {
                  const previous = pointerPosition.current;
                  // Resizing under a stationary pointer must not undo arrow navigation.
                  if (previous && (previous.x !== event.screenX || previous.y !== event.screenY)) setResultIndex(index);
                  pointerPosition.current = { x: event.screenX, y: event.screenY };
                }} onClick={() => activateResult(result)}>
                  {(result.application || result.tool) ? <>
                  <span className="application-icon" aria-hidden="true">{result.tool ? '↔' : 'Z'}</span>
                  <span className="application-info"><strong>{result.title}</strong><span>{(result.application ?? result.tool)?.description}</span></span>
                  <span className="application-open">{launching ? 'Opening…' : 'Open ↗'}</span>
                  </> : <><span>{result.title}</span><span aria-hidden="true">↗</span></>}
                </button>)}
                {!results.length && <p className="no-results">{active?.id === 'tools' && !query ? 'Your developer tools will appear here as we build them.' : <>Nothing here matches “{query}”.</>}</p>}
              </div>
              <p className="selection-message" role="status">{message || '↑ ↓ to select · Enter to open'}</p>
            </section>
          )}
        </div>
      </main>

      <footer className="preview-footer"><span className="lab-dot" /> Interaction study <span className="footer-divider">/</span> ↑ to pin <span className="footer-divider">·</span> Pause or ↓ to explore <span className="footer-divider">·</span> ← → to choose <span className="footer-divider">·</span> Enter to open</footer>
    </div>
  );
}

import { useEffect, useRef } from 'react';
import type { LauncherController } from './useLauncher';

type Props = Pick<
  LauncherController,
  | 'active'
  | 'query'
  | 'results'
  | 'selectedResult'
  | 'launching'
  | 'message'
  | 'layoutReady'
  | 'activateResult'
  | 'setResultIndex'
>;

export default function SearchResults({
  active,
  query,
  results,
  selectedResult,
  launching,
  message,
  layoutReady,
  activateResult,
  setResultIndex,
}: Props) {
  const resultButtons = useRef<(HTMLButtonElement | null)[]>([]);
  const pointerPosition = useRef<{ x: number; y: number } | null>(null);
  useEffect(() => {
    const track = (event: MouseEvent) => {
      pointerPosition.current = { x: event.screenX, y: event.screenY };
    };
    window.addEventListener('mousemove', track);
    return () => window.removeEventListener('mousemove', track);
  }, []);
  useEffect(() => {
    if (layoutReady) resultButtons.current[selectedResult]?.scrollIntoView({ block: 'nearest' });
  }, [selectedResult, results, layoutReady]);
  return (
    <section className="detail-panel" aria-label={active ? active.title : 'Search results'}>
      <div className="panel-heading">
        <div>
          <h1>{active?.title ?? 'Search results'}</h1>
          <p>{active?.hint ?? 'Apps and launcher sections in your workspace'}</p>
        </div>
        <span className="preview-badge">{active?.id === 'apps' ? 'Local app' : 'Preview'}</span>
      </div>
      <div className="sample-list" id="search-results" role="listbox" aria-label="Search results">
        {results.map((result, index) => (
          <button
            className={`search-result ${result.application || result.tool ? 'application-row' : ''} ${index === selectedResult ? 'is-selected' : ''}`}
            id={result.id}
            role="option"
            aria-selected={index === selectedResult}
            tabIndex={-1}
            key={result.id}
            ref={(element) => {
              resultButtons.current[index] = element;
            }}
            disabled={launching}
            onMouseDown={(event) => event.preventDefault()}
            onMouseMove={(event) => {
              const previous = pointerPosition.current;
              // Resizing under a stationary pointer must not undo arrow navigation.
              if (previous && (previous.x !== event.screenX || previous.y !== event.screenY))
                setResultIndex(index);
              pointerPosition.current = { x: event.screenX, y: event.screenY };
            }}
            onClick={() => activateResult(result)}
          >
            {result.application || result.tool ? (
              <>
                <span className="application-icon" aria-hidden="true">
                  {result.tool ? '↔' : 'Z'}
                </span>
                <span className="application-info">
                  <strong>{result.title}</strong>
                  <span>
                    {result.description ?? (result.application ?? result.tool)?.description}
                  </span>
                </span>
                <span className="application-open">{launching ? 'Opening…' : 'Open ↗'}</span>
              </>
            ) : (
              <>
                <span>{result.title}</span>
                <span aria-hidden="true">↗</span>
              </>
            )}
          </button>
        ))}
        {!results.length && (
          <p className="no-results">
            {active?.id === 'tools' && !query ? (
              'Your developer tools will appear here as we build them.'
            ) : (
              <>Nothing here matches “{query}”.</>
            )}
          </p>
        )}
      </div>
      <p className="selection-message" role="status">
        {message || '↑ ↓ to select · Enter to open'}
      </p>
    </section>
  );
}

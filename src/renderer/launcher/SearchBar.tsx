import type { LauncherController } from './useLauncher';

type Props = Pick<
  LauncherController,
  | 'input'
  | 'active'
  | 'awake'
  | 'query'
  | 'results'
  | 'selectedResult'
  | 'reset'
  | 'onSearchChange'
  | 'onSearchKeyDown'
>;

export default function SearchBar({
  input,
  active,
  awake,
  query,
  results,
  selectedResult,
  reset,
  onSearchChange,
  onSearchKeyDown,
}: Props) {
  return (
    <div className="search-pill">
      {active ? (
        <button className="back" onClick={reset} aria-label="Back to all launcher sections">
          ←
        </button>
      ) : (
        <span className="search-mark" aria-hidden="true">
          ⌕
        </span>
      )}
      <input
        ref={input}
        autoFocus
        disabled={!!window.zeusLauncher && !awake}
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
        onChange={(event) => onSearchChange(event.target.value)}
        onKeyDown={onSearchKeyDown}
      />
      <kbd className="search-shortcut" title="↑ to pin · ↓ to explore">
        ⌘ /
      </kbd>
    </div>
  );
}

import { DEFAULT_PINNED_LAYOUT, isPinnedLayout, type PinnedLayout } from '../../shared/pinned';
import { useEffect, useState } from 'react';
import type { Appearance } from '../../shared/appearance';
import type { Preferences } from '../../shared/preferences';

const KEY = 'zeus.beta.appearance.v1';
const LAYOUT_KEY = 'zeus.pinned-layout.v1';
function browserPreferences(): Preferences {
  let appearance: Appearance = 'system';
  let pinnedLayout: PinnedLayout = DEFAULT_PINNED_LAYOUT;
  try {
    const layout = localStorage.getItem(LAYOUT_KEY);
    if (isPinnedLayout(layout)) pinnedLayout = layout;
    const stored = localStorage.getItem(KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') appearance = stored;
  } catch {
    /* Use system. */
  }
  return {
    appearance,
    pinnedLayout,
    resolvedTheme:
      appearance === 'system'
        ? matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : appearance,
  };
}
function apply(preferences: Preferences) {
  document.documentElement.dataset.theme = preferences.resolvedTheme;
  document.documentElement.style.colorScheme = preferences.resolvedTheme;
}
export function initializeAppearance() {
  const preferences = browserPreferences();
  const initial = new URLSearchParams(location.search).get('theme');
  if (initial === 'light' || initial === 'dark') preferences.resolvedTheme = initial;
  apply(preferences);
}
export function usePreferences() {
  const [preferences, setPreferences] = useState<Preferences>(browserPreferences);
  const [error, setError] = useState('');
  useEffect(() => {
    const bridge = window.zeusLauncher ?? window.zeusAppearance;
    let disposed = false;
    function update(next: Preferences) {
      if (!disposed) {
        apply(next);
        setPreferences(next);
      }
    }
    if (bridge) {
      const unsubscribe = bridge.onPreferences(update);
      void bridge
        .getPreferences()
        .then(update)
        .catch(() => setError('Could not read appearance settings.'));
      return () => {
        disposed = true;
        unsubscribe();
      };
    }
    const refresh = () => update(browserPreferences());
    const system = matchMedia('(prefers-color-scheme: dark)');
    refresh();
    system.addEventListener('change', refresh);
    window.addEventListener('storage', refresh);
    window.addEventListener('zeus:appearance', refresh);
    return () => {
      disposed = true;
      system.removeEventListener('change', refresh);
      window.removeEventListener('storage', refresh);
      window.removeEventListener('zeus:appearance', refresh);
    };
  }, []);
  async function choose(appearance: Appearance) {
    try {
      let next: Preferences;
      if (window.zeusLauncher) next = await window.zeusLauncher.setAppearance(appearance);
      else {
        localStorage.setItem(KEY, appearance);
        next = browserPreferences();
        window.dispatchEvent(new Event('zeus:appearance'));
      }
      setPreferences(next);
      apply(next);
      setError('');
    } catch {
      setError('Could not save appearance. Please try again.');
    }
  }
  async function chooseLayout(layout: PinnedLayout) {
    try {
      let next: Preferences;
      if (window.zeusLauncher) next = await window.zeusLauncher.setPinnedLayout(layout);
      else {
        localStorage.setItem(LAYOUT_KEY, layout);
        next = browserPreferences();
        window.dispatchEvent(new Event('zeus:appearance'));
      }
      setPreferences(next);
      apply(next);
      setError('');
    } catch {
      setError('Could not save the pinned layout. Please try again.');
    }
  }
  return { preferences, setAppearance: choose, setPinnedLayout: chooseLayout, error };
}

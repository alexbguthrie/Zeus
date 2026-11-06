import { useEffect, useState } from 'react';
import type { Appearance, Preferences } from '../../shared/lifecycle';

const KEY = 'zeus.beta.appearance.v1';
function browserPreferences(): Preferences {
  let appearance: Appearance = 'system';
  try { const stored = localStorage.getItem(KEY); if (stored === 'light' || stored === 'dark' || stored === 'system') appearance = stored; } catch { /* Use system. */ }
  return { appearance, resolvedTheme: appearance === 'system' ? matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light' : appearance };
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
export function useAppearance() {
  const [preferences, setPreferences] = useState<Preferences>(browserPreferences);
  const [error, setError] = useState('');
  useEffect(() => {
    const bridge = window.betaShell ?? window.betaAppearance;
    let disposed = false;
    function update(next: Preferences) { if (!disposed) { apply(next); setPreferences(next); } }
    if (bridge) {
      const unsubscribe = bridge.onPreferences(update);
      void bridge.getPreferences().then(update).catch(() => setError('Could not read appearance settings.'));
      return () => { disposed = true; unsubscribe(); };
    }
    const refresh = () => update(browserPreferences());
    const system = matchMedia('(prefers-color-scheme: dark)');
    refresh();
    system.addEventListener('change', refresh);
    window.addEventListener('storage', refresh);
    window.addEventListener('zeus:appearance', refresh);
    return () => { disposed = true; system.removeEventListener('change', refresh); window.removeEventListener('storage', refresh); window.removeEventListener('zeus:appearance', refresh); };
  }, []);
  async function choose(appearance: Appearance) {
    try {
      let next: Preferences;
      if (window.betaShell) next = await window.betaShell.setAppearance(appearance);
      else { localStorage.setItem(KEY, appearance); next = browserPreferences(); window.dispatchEvent(new Event('zeus:appearance')); }
      setPreferences(next); apply(next); setError('');
    } catch { setError('Could not save appearance. Please try again.'); }
  }
  return { preferences, setAppearance: choose, error };
}

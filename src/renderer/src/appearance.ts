import { useEffect, useState } from 'react';

type Appearance = 'system' | 'light' | 'dark';
const key = 'zeus.beta.appearance.v1';

function readAppearance(): Appearance {
  try {
    const saved = localStorage.getItem(key);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch { /* Use the system appearance when storage is unavailable. */ }
  return 'system';
}

function applyAppearance(appearance: Appearance): void {
  document.documentElement.dataset.theme = appearance === 'system'
    ? matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    : appearance;
}

export function initializeAppearance(): void {
  applyAppearance(readAppearance());
}

export function useAppearance() {
  const [appearance, setAppearance] = useState<Appearance>(readAppearance);
  const [error, setError] = useState('');

  useEffect(() => {
    const system = matchMedia('(prefers-color-scheme: dark)');
    const refresh = () => applyAppearance(appearance);
    const sync = (event: StorageEvent) => {
      if (event.key === key || event.key === null) setAppearance(readAppearance());
    };
    refresh();
    system.addEventListener('change', refresh);
    window.addEventListener('storage', sync);
    return () => {
      system.removeEventListener('change', refresh);
      window.removeEventListener('storage', sync);
    };
  }, [appearance]);

  function choose(next: Appearance): void {
    setAppearance(next);
    try {
      localStorage.setItem(key, next);
      setError('');
    } catch {
      setError('Appearance changed for this session. Could not save your preference.');
    }
  }

  return { appearance, choose, error };
}

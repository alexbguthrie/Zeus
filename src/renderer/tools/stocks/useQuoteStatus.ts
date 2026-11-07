import { useEffect, useState } from 'react';
export type DemoDataState = 'ready' | 'loading' | 'offline' | 'stale' | 'unavailable';
const snapshotAt = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

// Replace this demo adapter when a market provider is introduced; no network requests.
export function useQuoteStatus() {
  const [scenario, setScenario] = useState<DemoDataState>('ready');
  const [online, setOnline] = useState(navigator.onLine);
  const [refreshing, setRefreshing] = useState(false);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);
  useEffect(() => {
    if (!refreshing) return;
    const timer = setTimeout(() => {
      setScenario('ready');
      setRefreshing(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [refreshing]);
  const state = !online ? 'offline' : refreshing ? 'loading' : scenario;
  const messages: Record<DemoDataState, string> = {
    ready: `Demo snapshot loaded at ${snapshotAt} · Not live`,
    loading: 'Loading demo quotes…',
    offline: 'Offline · Showing saved demo prices. Reconnect to refresh.',
    stale: 'Prices may be out of date · Showing an older demo snapshot.',
    unavailable: 'Quote unavailable · This demo symbol could not be loaded.',
  };
  return {
    state,
    message: messages[state],
    scenario,
    setScenario,
    retry: () => setRefreshing(true),
  };
}

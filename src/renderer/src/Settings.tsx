import type { Appearance, Preferences } from '../../shared/lifecycle';

export default function Settings({ preferences, onChange, onBack, error }: {
  preferences: Preferences; onChange(appearance: Appearance): void; onBack(): void; error: string;
}) {
  return <section className="settings-panel" aria-label="Settings">
    <header><button className="back" onClick={onBack} aria-label="Back to search">←</button><h1>Settings</h1></header>
    <fieldset><legend>Appearance</legend><p>Choose how Zeus looks.</p><div className="appearance-options">
      {(['light', 'dark', 'system'] as const).map((appearance) => <label key={appearance} className={preferences.appearance === appearance ? 'is-selected' : ''}>
        <input type="radio" name="appearance" value={appearance} checked={preferences.appearance === appearance} onChange={() => onChange(appearance)} />
        <span className={`appearance-swatch swatch-${appearance}`} aria-hidden="true"><span /><span /><span /></span>
        <span>{appearance === 'system' ? 'System' : appearance === 'light' ? 'Light' : 'Dark'}</span>
      </label>)}
    </div></fieldset>
    <p className="settings-status" role="status">{error || 'Applies to the launcher, pinned hub, and sample apps.'}</p>
  </section>;
}

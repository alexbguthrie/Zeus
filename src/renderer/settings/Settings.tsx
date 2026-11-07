import { pinnedLayouts, type PinnedLayout } from '../../shared/pinned';
import './settings.css';
import type { Appearance } from '../../shared/appearance';
import type { Preferences } from '../../shared/preferences';

type Props = {
  preferences: Preferences;
  onChange(appearance: Appearance): void;
  onLayoutChange(layout: PinnedLayout): void;
  onBack(): void;
  error: string;
};

export default function Settings({ preferences, onChange, onLayoutChange, onBack, error }: Props) {
  return (
    <section className="settings-panel" aria-label="Settings">
      <header>
        <button className="back" onClick={onBack} aria-label="Back to search">
          ←
        </button>
        <h1>Settings</h1>
      </header>
      <fieldset>
        <legend>Appearance</legend>
        <p>Choose how Zeus looks.</p>
        <div className="appearance-options">
          {(['light', 'dark', 'system'] as const).map((appearance) => (
            <label
              key={appearance}
              className={preferences.appearance === appearance ? 'is-selected' : ''}
            >
              <input
                type="radio"
                name="appearance"
                value={appearance}
                checked={preferences.appearance === appearance}
                onChange={() => onChange(appearance)}
              />
              <span className={`appearance-swatch swatch-${appearance}`} aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
              <span>
                {appearance === 'system' ? 'System' : appearance === 'light' ? 'Light' : 'Dark'}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset className="pinned-layout-options">
        <legend>Pinned layout</legend>
        <p>Choose how your pinned tools fit on screen.</p>
        <div className="layout-options">
          {(Object.keys(pinnedLayouts) as PinnedLayout[]).map((id) => (
            <label key={id} className={preferences.pinnedLayout === id ? 'is-selected' : ''}>
              <input
                type="radio"
                name="pinned-layout"
                checked={preferences.pinnedLayout === id}
                onChange={() => onLayoutChange(id)}
              />
              <span>
                <strong>{pinnedLayouts[id].title}</strong>
                <small>{pinnedLayouts[id].description}</small>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <p className="settings-status" role="status">
        {error || 'Preferences are saved on this device.'}
      </p>
    </section>
  );
}

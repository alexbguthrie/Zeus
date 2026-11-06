import { useAppearance } from './appearance';

export default function App() {
  const { appearance, choose, error } = useAppearance();

  return (
    <div className="preview">
      <header className="preview-header">
        <a href="#">Zeus <span>Your workspace, starting fresh.</span></a>
      </header>
      <main className="stage">
        <div className="launcher-stack">
          <section className="settings-panel" aria-labelledby="welcome-title">
            <header><h1 id="welcome-title">Welcome to Zeus</h1><span className="preview-badge">Ready to build</span></header>
            <fieldset>
              <legend>Appearance</legend>
              <p>Choose a theme for your workspace.</p>
              <div className="appearance-options">
                {(['light', 'dark', 'system'] as const).map((option) => (
                  <label key={option} className={appearance === option ? 'is-selected' : ''}>
                    <input type="radio" name="appearance" value={option} checked={appearance === option} onChange={() => choose(option)} />
                    <span className={`appearance-swatch swatch-${option}`} aria-hidden="true"><span /><span /></span>
                    {option[0].toUpperCase() + option.slice(1)}
                  </label>
                ))}
              </div>
            </fieldset>
            <p className="settings-status" role="status">{error || 'Your appearance preference is saved on this device.'}</p>
          </section>
        </div>
      </main>
      <footer className="preview-footer">
        <span className="lab-dot" aria-hidden="true" />
        <span>{window.zeus ? `Electron ${window.zeus.versions.electron}` : 'Browser preview'}</span>
        <span className="footer-divider" aria-hidden="true">/</span>
        <span>React · TypeScript · Vite</span>
      </footer>
    </div>
  );
}

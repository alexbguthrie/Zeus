import PinnedWorkspace from '../pinned/PinnedWorkspace';
import Settings from '../settings/Settings';
import { useAppearance } from '../settings/useAppearance';
import SearchBar from './SearchBar';
import SectionPicker from './SectionPicker';
import SearchResults from './SearchResults';
import LauncherError from './LauncherError';
import { useLauncher } from './useLauncher';
import './launcher.css';

export default function Launcher() {
  const launcher = useLauncher();
  const appearance = useAppearance();
  const showSearch = !launcher.pinned && !launcher.settingsOpen && !launcher.windowError;

  return (
    <div className="preview">
      <header className="preview-header">
        <a href="/" aria-label="Zeus home">
          zeus<span> / workspace</span>
        </a>
        <button className="replay" onClick={launcher.returnToLauncher}>
          Replay opening <span>↻</span>
        </button>
      </header>
      <main className="stage" aria-label="Launcher">
        <div className="launcher-stack" data-layout-ready={launcher.layoutReady}>
          {showSearch && <SearchBar {...launcher} />}
          {launcher.windowError && (
            <LauncherError message={launcher.windowError} onRetry={launcher.retryWindow} />
          )}
          {showSearch && launcher.launchError && (
            <LauncherError
              message={launcher.launchError}
              onRetry={launcher.retryLaunch}
              onDismiss={launcher.dismissLaunchError}
            />
          )}
          <PinnedWorkspace
            visible={launcher.pinned && !launcher.settingsOpen && !launcher.windowError}
            pending={!!window.zeusLauncher && !launcher.awake}
            onReturn={launcher.returnToLauncher}
            onLayoutChange={launcher.toolsChanged}
          />
          {launcher.settingsOpen && !launcher.windowError && (
            <Settings
              preferences={appearance.preferences}
              onChange={(value) => void appearance.setAppearance(value)}
              onBack={launcher.returnToLauncher}
              error={appearance.error}
            />
          )}
          {launcher.pickerMounted && !launcher.windowError && <SectionPicker {...launcher} />}
          {showSearch && (launcher.active || launcher.query) && <SearchResults {...launcher} />}
        </div>
      </main>
      <footer className="preview-footer">
        <span className="lab-dot" /> Interaction study
        <span className="footer-divider">/</span> ↑ to pin <span className="footer-divider">·</span>
        Pause or ↓ to explore <span className="footer-divider">·</span> ← → to choose
        <span className="footer-divider">·</span> Enter to open
      </footer>
    </div>
  );
}

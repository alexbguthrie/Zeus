import './styles/base.css';
import { createRoot } from 'react-dom/client';
import Launcher from './launcher/Launcher';
import { initializeAppearance } from './settings/usePreferences';

initializeAppearance();

if (new URLSearchParams(window.location.search).get('native') === '1') {
  document.documentElement.dataset.native = 'true';
}

const root = document.getElementById('root');
if (!root) throw new Error('Missing Zeus root element.');
createRoot(root).render(<Launcher />);

import { createRoot } from 'react-dom/client';
import Launcher from './Launcher';
import '../styles/styles.css';
import { initializeAppearance } from './useAppearance';

initializeAppearance();

if (new URLSearchParams(window.location.search).get('native') === '1') {
  document.documentElement.dataset.native = 'true';
}

const root = document.getElementById('root');
if (!root) throw new Error('Missing beta root element.');
createRoot(root).render(<Launcher />);

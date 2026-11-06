import { createRoot } from 'react-dom/client';
import { initializeAppearance } from '../../settings/useAppearance';
import ResizeImage from './ResizeImage';
import './styles.css';

initializeAppearance();
if (new URLSearchParams(location.search).get('native') === '1')
  document.documentElement.dataset.native = 'true';
createRoot(document.getElementById('root')!).render(<ResizeImage />);

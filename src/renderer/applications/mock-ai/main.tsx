import { createRoot } from 'react-dom/client';
import MockAI from './MockAI';
import './styles.css';
import { initializeAppearance } from '../../src/useAppearance';

initializeAppearance();

if (new URLSearchParams(location.search).get('native') === '1') document.documentElement.dataset.native = 'true';
const root = document.getElementById('root');
if (!root) throw new Error('Missing sample app root.');
createRoot(root).render(<MockAI />);

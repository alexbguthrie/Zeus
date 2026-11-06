import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { initializeAppearance } from './appearance';
import '../styles/styles.css';

initializeAppearance();
const root = document.getElementById('root');
if (!root) throw new Error('Missing Zeus root element.');
createRoot(root).render(<StrictMode><App /></StrictMode>);

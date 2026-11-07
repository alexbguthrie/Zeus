import '../../styles/base.css';
import { createRoot } from 'react-dom/client';
import { useState } from 'react';
import PinnedWorkspace, { type PinnedVariant } from '../../pinned/PinnedWorkspace';
import './preview.css';

const concepts: { id: PinnedVariant; name: string; description: string }[] = [
  { id: 'dock', name: 'Micro dock', description: 'A small icon dock. One tool opens underneath.' },
  {
    id: 'rail',
    name: 'Side rail',
    description: 'A narrow vertical rail. The tool opens beside it.',
  },
  {
    id: 'strip',
    name: 'Slim bar',
    description: 'One shallow row for quick notes, timing, or math.',
  },
];
const noop = () => {};
function PinnedPreviews() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  function changeTheme(next: 'light' | 'dark') {
    setTheme(next);
    document.documentElement.dataset.theme = next;
  }
  return (
    <main className="pinned-preview">
      <header className="preview-titlebar">
        <a href="../../index.html" className="preview-brand">
          Zeus <span>/ Design lab</span>
        </a>
        <div className="theme-switch" aria-label="Preview appearance">
          {(['light', 'dark'] as const).map((value) => (
            <button key={value} aria-pressed={theme === value} onClick={() => changeTheme(value)}>
              {value === 'light' ? 'Light' : 'Dark'}
            </button>
          ))}
        </div>
      </header>
      <div className="preview-intro">
        <p className="eyebrow">PINNED WORKSPACE</p>
        <h1>Less window. More room.</h1>
        <p>Three compact directions. Click an icon to try each tool.</p>
      </div>
      <div className="concept-grid">
        {concepts.map((concept, index) => (
          <section className="concept" key={concept.id} aria-label={concept.name}>
            <header className="concept-heading">
              <span className="concept-letter">{String.fromCharCode(65 + index)}</span>
              <h2>{concept.name}</h2>
            </header>
            <div className="concept-stage">
              <PinnedWorkspace
                visible
                pending={false}
                variant={concept.id}
                initialTool="timer"
                previewScope={`zeus.design.pinned.${concept.id}`}
                onReturn={() => {
                  location.href = '../../index.html';
                }}
                onLayoutChange={noop}
              />
            </div>
            <p className="concept-description">{concept.description}</p>
          </section>
        ))}
      </div>
      <footer className="preview-note">
        Icon-only controls · Names on hover · Independent preview notes
      </footer>
    </main>
  );
}
createRoot(document.getElementById('root')!).render(<PinnedPreviews />);

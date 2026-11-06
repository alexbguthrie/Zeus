import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import NotesCard from './notes/NotesCard';
import { useNotes } from './notes/useNotes';
import TimerCard from './timer/TimerCard';
import { formatTime, useTimer } from './timer/useTimer';
import CalculatorCard from './calculator/CalculatorCard';
import { useCalculator } from './calculator/useCalculator';
import PinnedToolIcon from './PinnedToolIcon';
import './pinned.css';

export type PinnedTool = 'notes' | 'timer' | 'calculator';
const tools: { id: PinnedTool; name: string }[] = [
  { id: 'notes', name: 'Notes' },
  { id: 'timer', name: 'Timer' },
  { id: 'calculator', name: 'Calculator' },
];

type Props = { visible: boolean; pending: boolean; onReturn(): void; onLayoutChange(): void };

export default function PinnedWorkspace({ visible, pending, onReturn, onLayoutChange }: Props) {
  const [open, setOpen] = useState<PinnedTool[]>([]);
  const dockButtons = useRef<(HTMLButtonElement | null)[]>([]);
  const notes = useNotes();
  const timer = useTimer();
  const calculator = useCalculator();

  useLayoutEffect(() => {
    onLayoutChange();
  }, [open, visible, onLayoutChange]);
  useEffect(() => {
    if (visible && !pending) dockButtons.current[0]?.focus();
  }, [visible, pending]);

  function toggle(tool: PinnedTool) {
    setOpen((current) => {
      if (current.includes(tool)) return current.filter((item) => item !== tool);
      return [...current.slice(-1), tool];
    });
  }

  useEffect(() => {
    if (!visible || pending) return;
    function shortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && !event.altKey && !event.isComposing) {
        const index = Number(event.key) - 1;
        if (index >= 0 && index < tools.length && Number.isInteger(index)) {
          event.preventDefault();
          toggle(tools[index].id);
        }
      }
    }
    window.addEventListener('keydown', shortcut);
    return () => window.removeEventListener('keydown', shortcut);
  }, [visible, pending]);

  if (!visible) return null;
  return (
    <section className="pinned-workspace" aria-label="Pinned workspace" inert={pending}>
      <header className="belt-bar">
        <div className="belt-heading">
          <strong>Zeus</strong>
        </div>
        {timer.deadline && (
          <span className="belt-running" aria-label="Timer running">
            {formatTime(timer.remainingTime)}
          </span>
        )}
        <button
          className="belt-return"
          onClick={onReturn}
          aria-label="Return to launcher"
          title="Return to launcher · Esc"
        >
          ↙
        </button>
      </header>

      <nav
        className="belt-dock"
        aria-label="Pinned tools"
        onKeyDown={(event) => {
          const index = dockButtons.current.indexOf(document.activeElement as HTMLButtonElement);
          if (index < 0 || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) return;
          event.preventDefault();
          dockButtons.current[
            (index + (event.key === 'ArrowRight' ? 1 : -1) + tools.length) % tools.length
          ]?.focus();
        }}
      >
        {tools.map((tool, index) => (
          <button
            className={`belt-tool ${open.includes(tool.id) ? 'is-open' : ''}`}
            key={tool.id}
            ref={(element) => {
              dockButtons.current[index] = element;
            }}
            onClick={() => toggle(tool.id)}
            aria-label={`${tool.name} tool`}
            aria-expanded={open.includes(tool.id)}
            aria-controls={`tool-card-${tool.id}`}
            title={`${tool.name} · ⌘${index + 1}`}
          >
            <span className="belt-orb">
              <PinnedToolIcon tool={tool.id} />
              {tool.id === 'timer' && timer.deadline && <span className="orb-dot" />}
            </span>
            <span className="belt-tool-name">
              {tool.name}
              <kbd>⌘{index + 1}</kbd>
            </span>
          </button>
        ))}
      </nav>

      <div className={`belt-cards ${open.length === 1 ? 'single-card' : ''}`}>
        {open.map((tool) => (
          <article
            className={`tool-card card-${tool}`}
            id={`tool-card-${tool}`}
            key={tool}
            aria-label={`${tools.find((item) => item.id === tool)!.name} card`}
          >
            <header className="card-header">
              <span>
                <PinnedToolIcon tool={tool} />
                {tools.find((item) => item.id === tool)!.name}
              </span>
              <button
                onClick={() => toggle(tool)}
                aria-label={`Tuck away ${tool}`}
                title="Tuck away"
              >
                ×
              </button>
            </header>
            {tool === 'notes' && <NotesCard {...notes} />}
            {tool === 'timer' && <TimerCard {...timer} />}
            {tool === 'calculator' && <CalculatorCard {...calculator} />}
          </article>
        ))}
      </div>
      <span className="sr-only" role="status">
        {open.length} of 2 tools open
      </span>
    </section>
  );
}

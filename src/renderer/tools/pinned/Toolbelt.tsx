import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { calculate } from './calculate';
import './toolbelt.css';

type Tool = 'notes' | 'timer' | 'calculator';
const tools: { id: Tool; name: string }[] = [
  { id: 'notes', name: 'Notes' }, { id: 'timer', name: 'Timer' }, { id: 'calculator', name: 'Calculator' },
];
const NOTE_KEY = 'zeus-toolbelt.note.v1';
function readNote() { try { return localStorage.getItem(NOTE_KEY) ?? ''; } catch { return ''; } }
function clock(milliseconds: number) {
  const seconds = Math.ceil(milliseconds / 1000);
  return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
}
function Icon({ tool }: { tool: Tool }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {tool === 'notes' && <><path d="M14 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" /><path d="m12 12 7-8 2 2-7 8-4 1 2-3ZM8 8h3M8 17h7" /></>}
    {tool === 'timer' && <><circle cx="12" cy="13" r="8" /><path d="M12 9v4l3 2M9 2h6M12 2v3M18 5l2-2" /></>}
    {tool === 'calculator' && <><rect x="5" y="2" width="14" height="20" rx="3" /><path d="M8 6h8M8 11h1M15 11h1M8 15h1M15 15h1M8 19h1M15 19h1" /></>}
  </svg>;
}

export default function Toolbelt({ visible, pending, onReturn, onLayoutChange }: {
  visible: boolean; pending: boolean; onReturn(): void; onLayoutChange(): void;
}) {
  const [open, setOpen] = useState<Tool[]>([]);
  const [note, setNote] = useState(readNote);
  const [saved, setSaved] = useState(true);
  const [duration, setDuration] = useState(5 * 60_000);
  const [remaining, setRemaining] = useState(duration);
  const [deadline, setDeadline] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now);
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const dockButtons = useRef<(HTMLButtonElement | null)[]>([]);
  const remainingTime = deadline ? Math.max(0, deadline - now) : remaining;
  const wordCount = note.trim() ? note.trim().split(/\s+/).length : 0;

  useEffect(() => {
    try { localStorage.setItem(NOTE_KEY, note); setSaved(true); }
    catch { setSaved(false); }
  }, [note]);

  useEffect(() => {
    if (!deadline) return;
    function tick() {
      const time = Date.now();
      setNow(time);
      if (time >= deadline!) { setDeadline(null); setRemaining(0); }
    }
    tick();
    const timer = window.setInterval(tick, 250);
    return () => window.clearInterval(timer);
  }, [deadline]);

  useLayoutEffect(() => { onLayoutChange(); }, [open, visible, onLayoutChange]);
  useEffect(() => {
    if (visible && !pending) dockButtons.current[0]?.focus();
  }, [visible, pending]);

  function toggle(tool: Tool) {
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
          event.preventDefault(); toggle(tools[index].id);
        }
      }
    }
    window.addEventListener('keydown', shortcut);
    return () => window.removeEventListener('keydown', shortcut);
  }, [visible, pending]);

  function runCalculation() {
    try { setResult(calculate(expression)); setError(''); }
    catch (failure) { setError(failure instanceof Error ? failure.message : 'Check the calculation.'); }
  }
  function toggleTimer() {
    if (deadline) { setRemaining(Math.max(0, deadline - Date.now())); setDeadline(null); }
    else { const time = Date.now(); setNow(time); setDeadline(time + (remaining || duration)); }
  }

  if (!visible) return null;
  return <section className="toolbelt" aria-label="Pinned toolbelt" inert={pending}>
    <header className="belt-bar">
      <div className="belt-heading"><strong>Zeus</strong></div>
      {deadline && <span className="belt-running" aria-label="Timer running">{clock(remainingTime)}</span>}
      <button className="belt-return" onClick={onReturn} aria-label="Return to launcher" title="Return to launcher · Esc">↙</button>
    </header>

    <nav className="belt-dock" aria-label="Tool belt" onKeyDown={(event) => {
      const index = dockButtons.current.indexOf(document.activeElement as HTMLButtonElement);
      if (index < 0 || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) return;
      event.preventDefault();
      dockButtons.current[(index + (event.key === 'ArrowRight' ? 1 : -1) + tools.length) % tools.length]?.focus();
    }}>
      {tools.map((tool, index) => <button className={`belt-tool ${open.includes(tool.id) ? 'is-open' : ''}`} key={tool.id} ref={(element) => { dockButtons.current[index] = element; }} onClick={() => toggle(tool.id)} aria-label={`${tool.name} tool`} aria-expanded={open.includes(tool.id)} aria-controls={`tool-card-${tool.id}`} title={`${tool.name} · ⌘${index + 1}`}>
        <span className="belt-orb"><Icon tool={tool.id} />{tool.id === 'timer' && deadline && <span className="orb-dot" />}</span>
        <span className="belt-tool-name">{tool.name}<kbd>⌘{index + 1}</kbd></span>
      </button>)}
    </nav>

    <div className={`belt-cards ${open.length === 1 ? 'single-card' : ''}`}>
      {open.map((tool) => <article className={`tool-card card-${tool}`} id={`tool-card-${tool}`} key={tool} aria-label={`${tools.find((item) => item.id === tool)!.name} card`}>
        <header className="card-header"><span><Icon tool={tool} />{tools.find((item) => item.id === tool)!.name}</span><button onClick={() => toggle(tool)} aria-label={`Tuck away ${tool}`} title="Tuck away">×</button></header>
        {tool === 'notes' && <div className="note-body"><textarea aria-label="Quick note" placeholder="Write a note…" value={note} onChange={(event) => setNote(event.target.value)} maxLength={20_000} /><footer><span>{saved ? 'Saved locally' : 'Session only'}</span><span>{wordCount} words</span></footer></div>}
        {tool === 'timer' && <div className="timer-body">
          <div className="timer-dial"><output aria-label="Time remaining">{clock(remainingTime)}</output><span>{remainingTime === 0 ? 'Finished' : deadline ? 'Running' : remainingTime < duration ? 'Paused' : 'Ready'}</span></div>
          <div className="timer-progress" role="progressbar" aria-label="Timer progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(100 * (1 - remainingTime / duration))}><span style={{ width: `${100 * (1 - remainingTime / duration)}%` }} /></div>
          <div className="timer-presets">{[1, 5, 15, 25].map((minutes) => <button key={minutes} aria-pressed={duration === minutes * 60_000} disabled={!!deadline} onClick={() => { setDuration(minutes * 60_000); setRemaining(minutes * 60_000); }}>{minutes}m</button>)}</div>
          <div className="timer-controls"><button className="primary-control" onClick={toggleTimer}>{deadline ? 'Pause' : remainingTime === 0 ? 'Start again' : remainingTime < duration ? 'Resume' : 'Start'}</button><button className="reset-timer" aria-label="Reset timer" onClick={() => { setDeadline(null); setRemaining(duration); }}>↻</button></div>
        </div>}
        {tool === 'calculator' && <form className="calculator-body" onSubmit={(event) => { event.preventDefault(); runCalculation(); }}>
          <input aria-label="Calculation" placeholder="12 × (4 + 2)" value={expression} maxLength={200} onChange={(event) => { setExpression(event.target.value); setError(''); }} autoComplete="off" spellCheck={false} />
          <output className={error ? 'calculation-error' : 'calculation-result'} aria-label="Calculation result" aria-live="polite">{error || result || '0'}</output>
          <div className="calculator-keys">{['(', ')', '⌫', 'C', '7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '−', '0', '.', '=', '+'].map((key) => <button key={key} type="button" className={key === '=' ? 'equals-key' : /[÷×−+]/.test(key) ? 'operator-key' : ''} aria-label={key === '⌫' ? 'Delete last digit' : key === 'C' ? 'Clear calculation' : key} onClick={() => {
            if (key === '=') runCalculation();
            else if (key === 'C') { setExpression(''); setResult(''); setError(''); }
            else if (key === '⌫') { setExpression((value) => value.slice(0, -1)); setError(''); }
            else { setExpression((value) => (value + key).slice(0, 200)); setError(''); }
          }}>{key}</button>)}</div>
        </form>}
      </article>)}
    </div>
    <span className="sr-only" role="status">{open.length} of 2 tools open</span>
  </section>;
}

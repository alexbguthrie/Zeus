import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { pinnedTools, type PinnedToolId } from '../tools/registry';
import { embeddedTools } from '../tools/embedded';
import ToolIcon from '../tools/ToolIcon';
import './pinned.css';
import './variants.css';

export type PinnedVariant = 'dock' | 'rail' | 'strip';
type Props = {
  visible: boolean;
  pending: boolean;
  onReturn(): void;
  onLayoutChange(): void;
  variant?: PinnedVariant;
  previewScope?: string;
  initialTool?: PinnedToolId;
};

export default function PinnedWorkspace({
  visible,
  pending,
  onReturn,
  onLayoutChange,
  variant,
  previewScope,
  initialTool,
}: Props) {
  const [open, setOpen] = useState<PinnedToolId[]>(initialTool ? [initialTool] : []);
  const [statuses, setStatuses] = useState<Partial<Record<PinnedToolId, string | null>>>({});
  const dockButtons = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();
  const limit = variant ? 1 : 2;
  const onStatusChange = useCallback((tool: PinnedToolId, status: string | null) => {
    setStatuses((current) => (current[tool] === status ? current : { ...current, [tool]: status }));
  }, []);

  useLayoutEffect(() => {
    onLayoutChange();
  }, [open, visible, onLayoutChange]);
  useEffect(() => {
    if (visible && !pending && !previewScope) dockButtons.current[0]?.focus();
  }, [visible, pending, previewScope]);

  const toggle = useCallback(
    (tool: PinnedToolId) => {
      setOpen((current) => {
        if (current.includes(tool)) return current.filter((item) => item !== tool);
        return limit === 1 ? [tool] : [...current.slice(-(limit - 1)), tool];
      });
    },
    [limit],
  );

  useEffect(() => {
    if (!visible || pending || previewScope) return;
    function shortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && !event.altKey && !event.isComposing) {
        const index = Number(event.key) - 1;
        if (Number.isInteger(index) && index >= 0 && index < pinnedTools.length) {
          event.preventDefault();
          toggle(pinnedTools[index].id);
        }
      }
    }
    window.addEventListener('keydown', shortcut);
    return () => window.removeEventListener('keydown', shortcut);
  }, [visible, pending, previewScope, toggle]);

  return (
    <section
      className="pinned-workspace"
      data-variant={variant}
      data-open={open.length > 0}
      hidden={!visible}
      aria-label="Pinned workspace"
      inert={pending || !visible}
    >
      <header className="belt-bar">
        <div className="belt-heading">
          <strong>Zeus</strong>
        </div>
        {pinnedTools.map(
          (tool) =>
            statuses[tool.id] && (
              <span key={tool.id} className="belt-running" aria-label={`${tool.title} running`}>
                {statuses[tool.id]}
              </span>
            ),
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
          if (index < 0 || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
          event.preventDefault();
          dockButtons.current[
            (index + (event.key === 'ArrowRight' ? 1 : -1) + pinnedTools.length) %
              pinnedTools.length
          ]?.focus();
        }}
      >
        {pinnedTools.map((tool, index) => (
          <button
            className={`belt-tool ${open.includes(tool.id) ? 'is-open' : ''}`}
            key={tool.id}
            ref={(element) => {
              dockButtons.current[index] = element;
            }}
            onClick={() => toggle(tool.id)}
            aria-label={`${tool.title} tool`}
            aria-expanded={open.includes(tool.id)}
            aria-controls={`${id}-tool-${tool.id}`}
            title={`${tool.title} · ⌘${index + 1}${statuses[tool.id] ? ` · ${statuses[tool.id]}` : ''}`}
          >
            <span className="belt-orb">
              <ToolIcon tool={tool.id} />
              {statuses[tool.id] && <span className="orb-dot" />}
            </span>
            {!variant && (
              <span className="belt-tool-name">
                {tool.title}
                <kbd>⌘{index + 1}</kbd>
              </span>
            )}
          </button>
        ))}
      </nav>
      <div className={`belt-cards ${open.length === 1 ? 'single-card' : ''}`}>
        {pinnedTools.map((tool) => {
          const View = embeddedTools[tool.id];
          const index = open.indexOf(tool.id);
          return (
            <article
              className={`tool-card card-${tool.id}`}
              id={`${id}-tool-${tool.id}`}
              key={tool.id}
              hidden={index < 0}
              style={{ order: index }}
              data-first={index === 0}
              aria-label={`${tool.title} card`}
            >
              <header className="card-header">
                {!variant && (
                  <span>
                    <ToolIcon tool={tool.id} />
                    {tool.title}
                  </span>
                )}
                <button
                  onClick={() => toggle(tool.id)}
                  aria-label={`Tuck away ${tool.id}`}
                  title="Tuck away"
                >
                  ×
                </button>
              </header>
              <View storageScope={previewScope} onStatusChange={onStatusChange} />
            </article>
          );
        })}
      </div>
      <span className="sr-only" role="status">
        {open.length} of {limit} tools open
      </span>
    </section>
  );
}

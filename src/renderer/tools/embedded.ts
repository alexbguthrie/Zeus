import type { ComponentType } from 'react';
import type { PinnedToolId } from './registry';
import NotesTool from './notes/NotesTool';
import TimerTool from './timer/TimerTool';
import CalculatorTool from './calculator/CalculatorTool';

export type EmbeddedToolProps = {
  storageScope?: string;
  onStatusChange(id: PinnedToolId, status: string | null): void;
};

// Every tool marked pinned must provide an embedded view. TypeScript checks this map.
export const embeddedTools = {
  notes: NotesTool,
  timer: TimerTool,
  calculator: CalculatorTool,
} satisfies Record<PinnedToolId, ComponentType<EmbeddedToolProps>>;

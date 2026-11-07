import type { ToolPresentation } from '../../shared/pinned';
import type { ComponentType } from 'react';
import type { PinnedToolId } from './registry';
import StocksTool from './stocks/StocksTool';
import NotesTool from './notes/NotesTool';
import TimerTool from './timer/TimerTool';
import CalculatorTool from './calculator/CalculatorTool';

export type EmbeddedToolProps = {
  storageScope?: string;
  presentation: ToolPresentation;
  onStatusChange(id: PinnedToolId, status: string | null): void;
};

// Every tool marked pinned must provide an embedded view. TypeScript checks this map.
export const embeddedTools = {
  stocks: { View: StocksTool, presentations: ['compact', 'inline'], minContentWidth: 260 },
  notes: { View: NotesTool, presentations: ['compact', 'inline'], minContentWidth: 200 },
  timer: { View: TimerTool, presentations: ['compact', 'inline'], minContentWidth: 200 },
  calculator: { View: CalculatorTool, presentations: ['compact', 'inline'], minContentWidth: 200 },
} satisfies Record<PinnedToolId, EmbeddedToolDefinition>;

export type EmbeddedToolDefinition = {
  View: ComponentType<EmbeddedToolProps>;
  presentations: readonly [ToolPresentation, ...ToolPresentation[]];
  minContentWidth: number;
};
export function resolveToolPresentation(
  tool: Pick<EmbeddedToolDefinition, 'presentations'>,
  preferred: ToolPresentation,
): ToolPresentation {
  return tool.presentations.includes(preferred) ? preferred : tool.presentations[0];
}

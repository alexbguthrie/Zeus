import type { ReactNode } from 'react';
import type { ToolPresentation } from '../../shared/pinned';
import './surface.css';

type Props = { presentation: ToolPresentation; children: ReactNode };

export default function ToolSurface({ presentation, children }: Props) {
  return (
    <div className="embedded-tool" data-tool-presentation={presentation}>
      {children}
    </div>
  );
}

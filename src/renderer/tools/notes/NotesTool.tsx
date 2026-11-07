import ToolSurface from '../ToolSurface';
import type { EmbeddedToolProps } from '../embedded';
import NotesCard from './NotesCard';
import { useNotes } from './useNotes';
import './styles.css';

export default function NotesTool({ storageScope, presentation }: EmbeddedToolProps) {
  const notes = useNotes(storageScope ? `${storageScope}.notes` : undefined);
  return (
    <ToolSurface presentation={presentation}>
      <NotesCard {...notes} />
    </ToolSurface>
  );
}

import type { EmbeddedToolProps } from '../embedded';
import NotesCard from './NotesCard';
import { useNotes } from './useNotes';
import './styles.css';

export default function NotesTool({ storageScope }: EmbeddedToolProps) {
  const notes = useNotes(storageScope ? `${storageScope}.notes` : undefined);
  return <NotesCard {...notes} />;
}

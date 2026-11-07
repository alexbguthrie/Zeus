import type { useNotes } from './useNotes';

export default function NotesCard({
  note,
  setNote,
  saved,
  wordCount,
}: ReturnType<typeof useNotes>) {
  return (
    <div className="note-body">
      <textarea
        aria-label="Quick note"
        placeholder="Write a note…"
        value={note}
        onChange={(event) => setNote(event.target.value)}
        maxLength={20_000}
      />
      <footer>
        <span>{saved ? 'Saved locally' : 'Session only'}</span>
        <span>{wordCount} words</span>
      </footer>
    </div>
  );
}

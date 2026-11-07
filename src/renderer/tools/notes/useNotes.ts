import { useEffect, useState } from 'react';

const NOTE_KEY = 'zeus-toolbelt.note.v1';
function readNote(key: string) {
  try {
    return localStorage.getItem(key) ?? '';
  } catch {
    return '';
  }
}

export function useNotes(storageKey = NOTE_KEY) {
  const [note, setNote] = useState(() => readNote(storageKey));
  const [saved, setSaved] = useState(true);
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, note);
      setSaved(true);
    } catch {
      setSaved(false);
    }
  }, [note, storageKey]);

  const wordCount = note.trim() ? note.trim().split(/\s+/).length : 0;
  return { note, setNote, saved, wordCount };
}

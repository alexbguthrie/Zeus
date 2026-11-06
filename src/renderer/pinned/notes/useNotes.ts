import { useEffect, useState } from 'react';

const NOTE_KEY = 'zeus-toolbelt.note.v1';
function readNote() {
  try {
    return localStorage.getItem(NOTE_KEY) ?? '';
  } catch {
    return '';
  }
}

export function useNotes() {
  const [note, setNote] = useState(readNote);
  const [saved, setSaved] = useState(true);
  useEffect(() => {
    try {
      localStorage.setItem(NOTE_KEY, note);
      setSaved(true);
    } catch {
      setSaved(false);
    }
  }, [note]);

  const wordCount = note.trim() ? note.trim().split(/\s+/).length : 0;
  return { note, setNote, saved, wordCount };
}

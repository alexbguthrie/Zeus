import { useEffect, useState } from 'react';

export function formatTime(milliseconds: number) {
  const seconds = Math.ceil(milliseconds / 1000);
  return `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
}

export function useTimer() {
  const [duration, setDuration] = useState(5 * 60_000);
  const [remaining, setRemaining] = useState(duration);
  const [deadline, setDeadline] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now);
  const remainingTime = deadline ? Math.max(0, deadline - now) : remaining;
  useEffect(() => {
    if (!deadline) return;
    function tick() {
      const time = Date.now();
      setNow(time);
      if (time >= deadline!) {
        setDeadline(null);
        setRemaining(0);
      }
    }
    tick();
    const timer = window.setInterval(tick, 250);
    return () => window.clearInterval(timer);
  }, [deadline]);

  function toggleTimer() {
    if (deadline) {
      setRemaining(Math.max(0, deadline - Date.now()));
      setDeadline(null);
    } else {
      const time = Date.now();
      setNow(time);
      setDeadline(time + (remaining || duration));
    }
  }

  return { duration, remainingTime, deadline, setDuration, setRemaining, setDeadline, toggleTimer };
}

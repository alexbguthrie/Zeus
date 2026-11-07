import { formatTime, type useTimer } from './useTimer';

export default function TimerCard({
  duration,
  remainingTime,
  deadline,
  setDuration,
  setRemaining,
  setDeadline,
  toggleTimer,
}: ReturnType<typeof useTimer>) {
  return (
    <div className="timer-body">
      <div className="timer-dial">
        <output aria-label="Time remaining">{formatTime(remainingTime)}</output>
        <span>
          {remainingTime === 0
            ? 'Finished'
            : deadline
              ? 'Running'
              : remainingTime < duration
                ? 'Paused'
                : 'Ready'}
        </span>
      </div>
      <div
        className="timer-progress"
        role="progressbar"
        aria-label="Timer progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(100 * (1 - remainingTime / duration))}
      >
        <span style={{ width: `${100 * (1 - remainingTime / duration)}%` }} />
      </div>
      <div className="timer-presets">
        {[1, 5, 15, 25].map((minutes) => (
          <button
            key={minutes}
            aria-pressed={duration === minutes * 60_000}
            disabled={!!deadline}
            onClick={() => {
              setDuration(minutes * 60_000);
              setRemaining(minutes * 60_000);
            }}
          >
            {minutes}m
          </button>
        ))}
      </div>
      <div className="timer-controls">
        <button className="primary-control" onClick={toggleTimer}>
          {deadline
            ? 'Pause'
            : remainingTime === 0
              ? 'Start again'
              : remainingTime < duration
                ? 'Resume'
                : 'Start'}
        </button>
        <button
          className="reset-timer"
          aria-label="Reset timer"
          onClick={() => {
            setDeadline(null);
            setRemaining(duration);
          }}
        >
          ↻
        </button>
      </div>
    </div>
  );
}

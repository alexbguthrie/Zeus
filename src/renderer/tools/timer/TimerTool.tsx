import ToolSurface from '../ToolSurface';
import { useEffect } from 'react';
import type { EmbeddedToolProps } from '../embedded';
import TimerCard from './TimerCard';
import { formatTime, useTimer } from './useTimer';
import './styles.css';

export default function TimerTool({ onStatusChange, presentation }: EmbeddedToolProps) {
  const timer = useTimer();
  const status = timer.deadline ? formatTime(timer.remainingTime) : null;
  useEffect(() => {
    onStatusChange('timer', status);
  }, [onStatusChange, status]);
  return (
    <ToolSurface presentation={presentation}>
      <TimerCard {...timer} />
    </ToolSurface>
  );
}

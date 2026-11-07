import type { EmbeddedToolProps } from '../embedded';
import ToolSurface from '../ToolSurface';
import CalculatorCard from './CalculatorCard';
import { useCalculator } from './useCalculator';
import './styles.css';

export default function CalculatorTool({ presentation }: EmbeddedToolProps) {
  const calculator = useCalculator();
  return (
    <ToolSurface presentation={presentation}>
      <CalculatorCard {...calculator} />
    </ToolSurface>
  );
}

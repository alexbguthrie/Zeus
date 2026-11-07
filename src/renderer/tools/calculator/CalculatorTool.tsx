import CalculatorCard from './CalculatorCard';
import { useCalculator } from './useCalculator';
import './styles.css';

export default function CalculatorTool() {
  const calculator = useCalculator();
  return <CalculatorCard {...calculator} />;
}

import { useState } from 'react';
import { calculate } from './calculate';

export function useCalculator() {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  function runCalculation() {
    try {
      setResult(calculate(expression));
      setError('');
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Check the calculation.');
    }
  }
  return { expression, setExpression, result, setResult, error, setError, runCalculation };
}

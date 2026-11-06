import type { useCalculator } from './useCalculator';

export default function CalculatorCard({
  expression,
  setExpression,
  result,
  setResult,
  error,
  setError,
  runCalculation,
}: ReturnType<typeof useCalculator>) {
  return (
    <form
      className="calculator-body"
      onSubmit={(event) => {
        event.preventDefault();
        runCalculation();
      }}
    >
      <input
        aria-label="Calculation"
        placeholder="12 × (4 + 2)"
        value={expression}
        maxLength={200}
        onChange={(event) => {
          setExpression(event.target.value);
          setError('');
        }}
        autoComplete="off"
        spellCheck={false}
      />
      <output
        className={error ? 'calculation-error' : 'calculation-result'}
        aria-label="Calculation result"
        aria-live="polite"
      >
        {error || result || '0'}
      </output>
      <div className="calculator-keys">
        {[
          '(',
          ')',
          '⌫',
          'C',
          '7',
          '8',
          '9',
          '÷',
          '4',
          '5',
          '6',
          '×',
          '1',
          '2',
          '3',
          '−',
          '0',
          '.',
          '=',
          '+',
        ].map((key) => (
          <button
            key={key}
            type="button"
            className={key === '=' ? 'equals-key' : /[÷×−+]/.test(key) ? 'operator-key' : ''}
            aria-label={key === '⌫' ? 'Delete last digit' : key === 'C' ? 'Clear calculation' : key}
            onClick={() => {
              if (key === '=') runCalculation();
              else if (key === 'C') {
                setExpression('');
                setResult('');
                setError('');
              } else if (key === '⌫') {
                setExpression((value) => value.slice(0, -1));
                setError('');
              } else {
                setExpression((value) => (value + key).slice(0, 200));
                setError('');
              }
            }}
          >
            {key}
          </button>
        ))}
      </div>
    </form>
  );
}

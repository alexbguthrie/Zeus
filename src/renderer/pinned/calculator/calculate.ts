// Small arithmetic parser: no eval, Function constructor, or code execution.
export function calculate(expression: string): string {
  const source = expression
    .replaceAll('×', '*')
    .replaceAll('÷', '/')
    .replaceAll('−', '-')
    .replace(/\s/g, '');
  if (!source || source.length > 200) throw new Error('Enter a shorter calculation.');
  const tokens = source.match(/\d+(?:\.\d*)?|\.\d+|[()+*/-]/g) ?? [];
  if (tokens.join('') !== source) throw new Error('Use numbers and + − × ÷ only.');
  let position = 0;
  function factor(): number {
    const token = tokens[position++];
    if (token === '+') return factor();
    if (token === '-') return -factor();
    if (token === '(') {
      const value = sum();
      if (tokens[position++] !== ')') throw new Error('Close the parentheses.');
      return value;
    }
    if (!token || !/^(?:\d|\.)/.test(token)) throw new Error('Finish the calculation.');
    return Number(token);
  }
  function product(): number {
    let value = factor();
    while (tokens[position] === '*' || tokens[position] === '/') {
      const operation = tokens[position++];
      const right = factor();
      if (operation === '/' && right === 0) throw new Error('Cannot divide by zero.');
      value = operation === '*' ? value * right : value / right;
    }
    return value;
  }
  function sum(): number {
    let value = product();
    while (tokens[position] === '+' || tokens[position] === '-') {
      const operation = tokens[position++];
      const right = product();
      value = operation === '+' ? value + right : value - right;
    }
    return value;
  }
  const result = sum();
  if (position !== tokens.length) throw new Error('Check the calculation.');
  if (!Number.isFinite(result)) throw new Error('That result is too large.');
  return String(Number(result.toPrecision(12)));
}

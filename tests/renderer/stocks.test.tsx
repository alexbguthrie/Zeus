// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import StocksView from '../../src/renderer/tools/stocks/StocksView';
import { useWatchlist } from '../../src/renderer/tools/stocks/useWatchlist';

function Example({ inline = false, scope }: { inline?: boolean; scope?: string }) {
  return <StocksView watchlist={useWatchlist(scope)} inline={inline} />;
}

afterEach(() => {
  cleanup();
  localStorage.clear();
});

it('saves added and removed stocks across remounts', () => {
  const view = render(<Example />);
  fireEvent.change(screen.getByLabelText('Add stock'), { target: { value: 'AMZN' } });
  fireEvent.click(screen.getByRole('button', { name: 'Remove AAPL' }));
  view.unmount();
  render(<Example />);
  expect(screen.getByRole('button', { name: 'View AMZN' })).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'View AAPL' })).toBeNull();
});

it('shares watchlist changes between full and inline views', () => {
  render(
    <>
      <Example />
      <Example inline />
    </>,
  );
  fireEvent.change(screen.getByLabelText('Add stock'), { target: { value: 'TSLA' } });
  fireEvent.change(screen.getByLabelText('Stock'), { target: { value: 'TSLA' } });
  expect(screen.getAllByText('$224.10')).toHaveLength(2);
  fireEvent.click(screen.getByRole('button', { name: 'Remove TSLA' }));
  expect((screen.getByLabelText('Stock') as HTMLSelectElement).value).toBe('AAPL');
});

it('keeps preview data separate and allows an empty watchlist', () => {
  localStorage.setItem('preview.stocks', '[]');
  const view = render(<Example inline scope="preview" />);
  fireEvent.change(screen.getByLabelText('Add stock'), { target: { value: 'GOOGL' } });
  expect(localStorage.getItem('zeus.example.stocks.watchlist.v1')).toBeNull();
  view.unmount();
  render(<Example scope="preview" />);
  fireEvent.click(screen.getByRole('button', { name: 'Remove GOOGL' }));
  expect(screen.getByText('Add a demo stock to start your watchlist.')).toBeTruthy();
});

it('filters stale or invalid symbols from saved data', () => {
  localStorage.setItem('preview.stocks', '["AAPL", "AAPL", "UNKNOWN", null]');
  render(<Example scope="preview" />);
  expect(screen.getAllByRole('button', { name: /^View / })).toHaveLength(1);
});

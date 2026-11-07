// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import PinSettings from '../../src/renderer/tools/stocks/PinSettings';
import StocksApp from '../../src/renderer/tools/stocks/StocksApp';
import StocksTool from '../../src/renderer/tools/stocks/StocksTool';
import StockDetail from '../../src/renderer/tools/stocks/StockDetail';
import { demoQuotes } from '../../src/renderer/tools/stocks/demo-quotes';
import { findResults } from '../../src/renderer/launcher/search';
import StocksView from '../../src/renderer/tools/stocks/StocksView';
import { useWatchlist } from '../../src/renderer/tools/stocks/useWatchlist';

function Example({ inline = false, scope }: { inline?: boolean; scope?: string }) {
  return <StocksView watchlist={useWatchlist(scope)} inline={inline} />;
}

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
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

it('persists selection, pin choices, and keyboard reordering', () => {
  function Dashboard() {
    const list = useWatchlist();
    return (
      <>
        <StocksView watchlist={list} manage />
        <PinSettings watchlist={list} />
        <output>{list.active?.symbol}</output>
      </>
    );
  }
  const view = render(<Dashboard />);
  fireEvent.click(screen.getByRole('button', { name: 'View MSFT' }));
  fireEvent.change(screen.getByLabelText('Pinned content'), { target: { value: 'stock' } });
  fireEvent.change(screen.getByLabelText('Pinned stock'), { target: { value: 'NVDA' } });
  fireEvent.keyDown(screen.getByRole('button', { name: 'View MSFT' }), {
    key: 'ArrowUp',
    altKey: true,
  });
  view.unmount();
  render(<Dashboard />);
  expect(screen.getByRole('status').textContent).toBe('MSFT');
  expect((screen.getByLabelText('Pinned stock') as HTMLSelectElement).value).toBe('NVDA');
  expect(screen.getAllByRole('button', { name: /^View / })[0].getAttribute('aria-label')).toBe(
    'View MSFT',
  );
});

it('finds a ticker from the launcher and selects it in an already mounted app', () => {
  render(<Example inline />);
  const result = findResults('$TSLA', null)[0];
  expect(result.title).toContain('Tesla');
  act(() => result.prepareOpen?.());
  expect((screen.getByLabelText('Stock') as HTMLSelectElement).value).toBe('TSLA');
});

it('searches available stocks and explains unavailable symbols', () => {
  function Dashboard() {
    return <StocksView watchlist={useWatchlist()} manage />;
  }
  render(<Dashboard />);
  fireEvent.click(screen.getByRole('button', { name: '+ Add stock' }));
  fireEvent.change(screen.getByLabelText('Find a demo stock'), { target: { value: 'unknown' } });
  expect(screen.getByRole('status').textContent).toContain('No demo symbol found');
  fireEvent.change(screen.getByLabelText('Find a demo stock'), { target: { value: 'Tesla' } });
  fireEvent.click(screen.getByRole('button', { name: 'Add TSLA · Tesla' }));
  expect(screen.getByRole('button', { name: 'View TSLA' })).toBeTruthy();
});

it('changes chart data by range and exposes a keyboard-accessible price inspector', () => {
  render(<StockDetail quote={demoQuotes[0]} />);
  const before = document.querySelector('.stocks-chart polyline')?.getAttribute('points');
  fireEvent.click(screen.getByRole('button', { name: '1M' }));
  expect(document.querySelector('.stocks-chart polyline')?.getAttribute('points')).not.toBe(before);
  fireEvent.change(screen.getByRole('slider', { name: 'Chart price point' }), {
    target: { value: '0' },
  });
  expect(screen.getByRole('slider').getAttribute('aria-valuetext')).toContain('Point 1');
});

it('expands quick peek and restores compact tool height on return', () => {
  const onSizeChange = vi.fn();
  render(
    <StocksTool presentation="inline" onStatusChange={() => {}} onSizeChange={onSizeChange} />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Quick peek' }));
  expect(onSizeChange).toHaveBeenLastCalledWith('stocks', 420);
  expect(screen.getByRole('slider', { name: 'Chart price point' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: '← Watchlist' }));
  expect(onSizeChange).toHaveBeenLastCalledWith('stocks', undefined);
});

it('shows recoverable demo data states without removing the watchlist', () => {
  vi.useFakeTimers();
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
  render(<StocksApp />);
  fireEvent.change(screen.getByLabelText('Demo data state'), { target: { value: 'unavailable' } });
  expect(screen.getByRole('heading', { name: 'Quote unavailable' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'View AAPL' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
  expect(screen.getByRole('heading', { name: 'Loading quotes…' })).toBeTruthy();
  act(() => {
    vi.advanceTimersByTime(600);
  });
  expect(screen.getByRole('region', { name: 'Apple stock details' })).toBeTruthy();
  fireEvent.change(screen.getByLabelText('Demo data state'), { target: { value: 'stale' } });
  expect(screen.getByText(/Prices may be out of date/)).toBeTruthy();
  fireEvent.change(screen.getByLabelText('Demo data state'), { target: { value: 'offline' } });
  expect(screen.getByText(/Offline · Showing saved demo prices/)).toBeTruthy();
  vi.useRealTimers();
});

// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import PinnedWorkspace from '../../src/renderer/pinned/PinnedWorkspace';

const defaults = { visible: true, pending: false, onReturn: () => {}, onLayoutChange: () => {} };

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.useRealTimers();
});

it('keeps a timer running when its workspace is hidden', () => {
  vi.useFakeTimers();
  const view = render(<PinnedWorkspace {...defaults} />);
  fireEvent.click(screen.getByRole('button', { name: 'Timer tool' }));
  fireEvent.click(screen.getByRole('button', { name: 'Start' }));
  view.rerender(<PinnedWorkspace {...defaults} visible={false} />);
  act(() => {
    vi.advanceTimersByTime(6000);
  });
  view.rerender(<PinnedWorkspace {...defaults} />);
  expect(screen.getByLabelText('Time remaining').textContent).toBe('04:54');
});

it('keeps preview notes separate from real notes', () => {
  localStorage.setItem('zeus-toolbelt.note.v1', 'My real note');
  render(<PinnedWorkspace {...defaults} variant="dock" previewScope="test-design" />);
  const button = screen.getByRole('button', { name: 'Notes tool' });
  expect(button.textContent).toBe('');
  expect(button.title).toContain('Notes');
  fireEvent.click(button);
  fireEvent.change(screen.getByRole('textbox', { name: 'Quick note' }), {
    target: { value: 'Mock note' },
  });
  expect(localStorage.getItem('zeus-toolbelt.note.v1')).toBe('My real note');
  expect(localStorage.getItem('test-design.notes')).toBe('Mock note');
});

it('switches compact tools without discarding a tucked-away calculation', () => {
  render(<PinnedWorkspace {...defaults} variant="dock" previewScope="test-design" />);
  fireEvent.click(screen.getByRole('button', { name: 'Calculator tool' }));
  const field = screen.getByRole('textbox', { name: 'Calculation' });
  fireEvent.change(field, { target: { value: '12 * (4 + 2)' } });
  fireEvent.submit(field.closest('form')!);
  fireEvent.click(screen.getByRole('button', { name: 'Notes tool' }));
  expect(screen.queryByRole('textbox', { name: 'Calculation' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Calculator tool' }));
  expect(screen.getByLabelText('Calculation result').textContent).toBe('72');
  expect(screen.getByText('1 of 1 tools open')).toBeTruthy();
});

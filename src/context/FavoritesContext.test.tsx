import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FavoritesProvider } from './FavoritesContext';
import { useFavorites } from './favorites-context';

const STORAGE_KEY = 'hana_author_favorites_v1';

const Probe = () => {
  const { favorites, toggleFavorite } = useFavorites();
  return (
    <div>
      <span data-testid="ids">{favorites.join(',')}</span>
      <button onClick={() => toggleFavorite(1)}>toggle-1</button>
      <button onClick={() => toggleFavorite(2)}>toggle-2</button>
    </div>
  );
};

const renderProbe = () =>
  render(
    <FavoritesProvider>
      <Probe />
    </FavoritesProvider>,
  );

describe('FavoritesProvider', () => {
  it('starts empty when nothing is stored', () => {
    renderProbe();

    expect(screen.getByTestId('ids')).toHaveTextContent('');
  });

  it('toggle adds, toggle again removes', async () => {
    const user = userEvent.setup();
    renderProbe();

    await user.click(screen.getByRole('button', { name: 'toggle-1' }));
    expect(screen.getByTestId('ids')).toHaveTextContent('1');

    await user.click(screen.getByRole('button', { name: 'toggle-1' }));
    expect(screen.getByTestId('ids')).toHaveTextContent('');
  });

  it('persists to localStorage', async () => {
    const user = userEvent.setup();
    renderProbe();

    await user.click(screen.getByRole('button', { name: 'toggle-1' }));
    await user.click(screen.getByRole('button', { name: 'toggle-2' }));

    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')).toEqual([1, 2]);
  });

  it('hydrates from localStorage on mount', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([1, 7]));

    renderProbe();

    expect(screen.getByTestId('ids')).toHaveTextContent('1,7');
  });

  it('survives junk under the storage key', () => {
    localStorage.setItem(STORAGE_KEY, 'not-json');
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    renderProbe();

    expect(screen.getByTestId('ids')).toHaveTextContent('');
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it('ignores valid JSON that is not an array', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ a: 1 }));

    renderProbe();

    expect(screen.getByTestId('ids')).toHaveTextContent('');
  });

  it('drops non-numeric ids', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([1, 'two', null, 7]));

    renderProbe();

    expect(screen.getByTestId('ids')).toHaveTextContent('1,7');
  });

  it('useFavorites outside the provider throws', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<Probe />)).toThrow(/FavoritesProvider/);

    consoleError.mockRestore();
  });
});

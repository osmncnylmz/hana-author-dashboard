import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FavoritesProvider } from './FavoritesContext';
import { useFavorites } from './favorites-context';

const STORAGE_KEY = 'hana_author_favorites_v1';

const Probe = () => {
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  return (
    <div>
      <span data-testid="ids">{favorites.join(',')}</span>
      <span data-testid="is-fav-1">{String(isFavorite(1))}</span>
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
    expect(screen.getByTestId('is-fav-1')).toHaveTextContent('false');
  });

  it('adds an id on the first toggle and removes it on the second', async () => {
    const user = userEvent.setup();
    renderProbe();

    await user.click(screen.getByRole('button', { name: 'toggle-1' }));
    expect(screen.getByTestId('ids')).toHaveTextContent('1');
    expect(screen.getByTestId('is-fav-1')).toHaveTextContent('true');

    await user.click(screen.getByRole('button', { name: 'toggle-1' }));
    expect(screen.getByTestId('ids')).toHaveTextContent('');
    expect(screen.getByTestId('is-fav-1')).toHaveTextContent('false');
  });

  it('persists the selection to localStorage', async () => {
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
    expect(screen.getByTestId('is-fav-1')).toHaveTextContent('true');
  });

  it('falls back to an empty list when the stored value is not valid JSON', () => {
    localStorage.setItem(STORAGE_KEY, 'not-json');
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    renderProbe();

    expect(screen.getByTestId('ids')).toHaveTextContent('');
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it('falls back to an empty list when the stored value is valid JSON of the wrong shape', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ a: 1 }));

    renderProbe();

    expect(screen.getByTestId('ids')).toHaveTextContent('');
    expect(screen.getByTestId('is-fav-1')).toHaveTextContent('false');
  });

  it('drops non-numeric entries from a stored array', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([1, 'two', null, 7]));

    renderProbe();

    expect(screen.getByTestId('ids')).toHaveTextContent('1,7');
  });

  it('throws when useFavorites is used outside the provider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<Probe />)).toThrow(/FavoritesProvider/);

    consoleError.mockRestore();
  });
});

import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { UserCard } from './UserCard';
import { FavoritesProvider } from '../context/FavoritesContext';
import type { User } from '../types';

const user: User = {
  id: 3,
  name: 'Clementine Bauch',
  username: 'Samantha',
  email: 'Nathan@yesenia.net',
  company: { name: 'Romaguera-Jacobson' },
};

const renderCard = () =>
  render(
    <FavoritesProvider>
      <MemoryRouter>
        <UserCard user={user} />
      </MemoryRouter>
    </FavoritesProvider>,
  );

describe('UserCard', () => {
  it('shows the author name, e-mail and company', () => {
    renderCard();

    expect(screen.getByRole('heading', { name: 'Clementine Bauch' })).toBeInTheDocument();
    expect(screen.getByText('Nathan@yesenia.net')).toBeInTheDocument();
    expect(screen.getByText('Romaguera-Jacobson')).toBeInTheDocument();
  });

  it('links to the detail route for that author', () => {
    renderCard();

    expect(screen.getByRole('link', { name: /Profili İncele/i })).toHaveAttribute(
      'href',
      '/user/3',
    );
  });

  it('writes the author id through to the favourites store when starred', async () => {
    const person = userEvent.setup();
    renderCard();

    await person.click(screen.getByRole('button'));

    expect(
      JSON.parse(localStorage.getItem('hana_author_favorites_v1') ?? '[]'),
    ).toEqual([3]);
  });
});

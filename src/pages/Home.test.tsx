import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Home } from './Home';
import { FavoritesProvider } from '../context/FavoritesContext';
import api from '../api/axiosInstance';

vi.mock('../api/axiosInstance', () => ({
  default: { get: vi.fn() },
}));

const get = vi.mocked(api.get);

const users = [
  {
    id: 1,
    name: 'Leanne Graham',
    username: 'Bret',
    email: 'Sincere@april.biz',
    company: { name: 'Romaguera-Crona' },
  },
  {
    id: 2,
    name: 'Ervin Howell',
    username: 'Antonette',
    email: 'Shanna@melissa.tv',
    company: { name: 'Deckow-Crist' },
  },
];

const renderHome = () =>
  render(
    <FavoritesProvider>
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    </FavoritesProvider>,
  );

describe('Home', () => {
  beforeEach(() => {
    get.mockReset();
  });

  it('fetches /users and renders a card each', async () => {
    get.mockResolvedValue({ data: users });

    renderHome();

    expect(await screen.findByText('Leanne Graham')).toBeInTheDocument();
    expect(screen.getByText('Ervin Howell')).toBeInTheDocument();
    expect(get).toHaveBeenCalledWith('/users');
  });

  it('filters by name', async () => {
    const person = userEvent.setup();
    get.mockResolvedValue({ data: users });
    renderHome();
    await screen.findByText('Leanne Graham');

    await person.type(screen.getByRole('textbox'), 'ervin');

    expect(screen.getByText('Ervin Howell')).toBeInTheDocument();
    expect(screen.queryByText('Leanne Graham')).not.toBeInTheDocument();
  });

  it('and by company', async () => {
    const person = userEvent.setup();
    get.mockResolvedValue({ data: users });
    renderHome();
    await screen.findByText('Leanne Graham');

    await person.type(screen.getByRole('textbox'), 'deckow');

    expect(screen.getByText('Ervin Howell')).toBeInTheDocument();
    expect(screen.queryByText('Leanne Graham')).not.toBeInTheDocument();
  });

  it('empty state quotes the query back', async () => {
    const person = userEvent.setup();
    get.mockResolvedValue({ data: users });
    renderHome();
    await screen.findByText('Leanne Graham');

    await person.type(screen.getByRole('textbox'), 'zzzz');

    expect(screen.getByText(/"zzzz" ile eşleşen bir yazar bulunamadı\./)).toBeInTheDocument();
  });

  it('error state offers a retry', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    get.mockRejectedValue(new Error('offline'));

    renderHome();

    expect(await screen.findByText('Sistemsel Bir Hata Oluştu')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tekrar Dene' })).toBeInTheDocument();
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});

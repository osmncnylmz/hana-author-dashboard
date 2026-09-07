import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PostForm } from './PostForm';

const TITLE_PLACEHOLDER = 'Etkileyici bir başlık yazın...';
const BODY_PLACEHOLDER = 'Neler hakkında yazmak istersiniz?';

describe('PostForm', () => {
  it('submits, then clears both fields', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<PostForm onSubmit={onSubmit} />);

    const title = screen.getByPlaceholderText(TITLE_PLACEHOLDER);
    const body = screen.getByPlaceholderText(BODY_PLACEHOLDER);

    await user.type(title, 'Kapadokya rehberi');
    await user.type(body, 'Balonlar gün doğumunda kalkıyor.');
    await user.click(screen.getByRole('button', { name: /Yayınla/i }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith('Kapadokya rehberi', 'Balonlar gün doğumunda kalkıyor.');
    expect(title).toHaveValue('');
    expect(body).toHaveValue('');
  });

  it('will not submit a whitespace-only field', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<PostForm onSubmit={onSubmit} />);

    await user.type(screen.getByPlaceholderText(TITLE_PLACEHOLDER), '   ');
    await user.type(screen.getByPlaceholderText(BODY_PLACEHOLDER), 'gerçek içerik');
    await user.click(screen.getByRole('button', { name: /Yayınla/i }));

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('disables the controls while the submit promise is pending', async () => {
    const user = userEvent.setup();
    let resolveSubmit: () => void = () => {};
    const onSubmit = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveSubmit = resolve;
        }),
    );
    render(<PostForm onSubmit={onSubmit} />);

    await user.type(screen.getByPlaceholderText(TITLE_PLACEHOLDER), 'Başlık');
    await user.type(screen.getByPlaceholderText(BODY_PLACEHOLDER), 'Gövde');
    await user.click(screen.getByRole('button', { name: /Yayınla/i }));

    expect(await screen.findByRole('button', { name: /Yayınlanıyor/i })).toBeDisabled();
    expect(screen.getByPlaceholderText(TITLE_PLACEHOLDER)).toBeDisabled();

    resolveSubmit();
    expect(await screen.findByRole('button', { name: /^Yayınla$/i })).toBeEnabled();
  });

  it('keeps the draft when onSubmit rejects', async () => {
    const user = userEvent.setup();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const onSubmit = vi.fn().mockRejectedValue(new Error('network down'));
    render(<PostForm onSubmit={onSubmit} />);

    const title = screen.getByPlaceholderText(TITLE_PLACEHOLDER);
    await user.type(title, 'Başlık');
    await user.type(screen.getByPlaceholderText(BODY_PLACEHOLDER), 'Gövde');
    await user.click(screen.getByRole('button', { name: /Yayınla/i }));

    expect(await screen.findByRole('button', { name: /^Yayınla$/i })).toBeEnabled();
    expect(title).toHaveValue('Başlık');
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});

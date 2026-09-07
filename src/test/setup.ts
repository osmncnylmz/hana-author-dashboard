import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';

/**
 * A minimal, spec-shaped in-memory `Storage`.
 *
 * jsdom supplies its own `localStorage`, but Node >= 25 also defines a global
 * `localStorage` that is inert unless the process is started with
 * `--localstorage-file`, and that stub wins in the jsdom test environment.
 * Installing our own implementation keeps the favourites tests deterministic
 * across Node versions instead of depending on which one happens to be there.
 */
class MemoryStorage implements Storage {
  #entries = new Map<string, string>();

  get length(): number {
    return this.#entries.size;
  }

  key(index: number): string | null {
    return [...this.#entries.keys()][index] ?? null;
  }

  getItem(key: string): string | null {
    return this.#entries.get(String(key)) ?? null;
  }

  setItem(key: string, value: string): void {
    this.#entries.set(String(key), String(value));
  }

  removeItem(key: string): void {
    this.#entries.delete(String(key));
  }

  clear(): void {
    this.#entries.clear();
  }

  [name: string]: unknown;
}

const storage = new MemoryStorage();

for (const target of new Set<object>([globalThis, globalThis.window])) {
  if (target) {
    Object.defineProperty(target, 'localStorage', {
      value: storage,
      configurable: true,
      writable: true,
    });
  }
}

// The favourites provider writes to localStorage, so every test starts from a
// clean slate and the suite stays order-independent.
afterEach(() => {
  localStorage.clear();
});

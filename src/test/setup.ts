import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';

// jsdom brings a localStorage, but Node >= 25 defines a global one too, and that one
// is inert unless the process was started with --localstorage-file. Inside the jsdom
// environment the inert stub is the one that wins, which turns every favorites test
// into a coin flip on the Node version. So: our own Storage, and no surprises.
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

// the provider writes on every change
afterEach(() => {
  localStorage.clear();
});

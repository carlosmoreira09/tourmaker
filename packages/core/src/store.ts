import { isBrowser } from "./dom";
import type { SeenRecord, TourStore } from "./types";

/**
 * Default store: persists seen-state to `localStorage`. SSR-safe — every method
 * no-ops (or returns null) when there is no `window`, so it's harmless to create
 * during server rendering.
 */
export function localStorageStore(namespace = "tourmaker"): TourStore {
  const keyFor = (id: string) => `${namespace}:seen:${id}`;

  return {
    getSeen(tourId) {
      if (!isBrowser()) return null;
      try {
        const raw = window.localStorage.getItem(keyFor(tourId));
        return raw ? (JSON.parse(raw) as SeenRecord) : null;
      } catch {
        return null;
      }
    },
    setSeen(tourId, record) {
      if (!isBrowser()) return;
      try {
        window.localStorage.setItem(keyFor(tourId), JSON.stringify(record));
      } catch {
        // storage full / disabled — ignore
      }
    },
    clear(tourId) {
      if (!isBrowser()) return;
      try {
        if (tourId) {
          window.localStorage.removeItem(keyFor(tourId));
          return;
        }
        const prefix = `${namespace}:seen:`;
        for (let i = window.localStorage.length - 1; i >= 0; i--) {
          const k = window.localStorage.key(i);
          if (k && k.startsWith(prefix)) window.localStorage.removeItem(k);
        }
      } catch {
        // ignore
      }
    },
  };
}

/** In-memory store — for tests, SSR, or when you don't want any persistence. */
export function memoryStore(): TourStore {
  const map = new Map<string, SeenRecord>();
  return {
    getSeen: (tourId) => map.get(tourId) ?? null,
    setSeen: (tourId, record) => void map.set(tourId, record),
    clear: (tourId) => (tourId ? void map.delete(tourId) : map.clear()),
  };
}

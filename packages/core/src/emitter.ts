export type Listener<T> = (value: T) => void;

/** Minimal synchronous typed event emitter. No deps, works anywhere. */
export class Emitter<T> {
  private listeners = new Set<Listener<T>>();

  subscribe(fn: Listener<T>): () => void {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  emit(value: T): void {
    for (const fn of [...this.listeners]) fn(value);
  }

  clear(): void {
    this.listeners.clear();
  }
}

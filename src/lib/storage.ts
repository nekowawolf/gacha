type Snapshot<T> = { value: T; persistent: boolean };

/** Cached snapshots keep useSyncExternalStore stable and preserve SSR hydration. */
export function createStorage<T>(key: string, fallback: T, validate: (value: unknown) => value is T) {
  const serverSnapshot: Snapshot<T> = { value: fallback, persistent: true };
  let snapshot = serverSnapshot;
  let initialized = false;
  const listeners = new Set<() => void>();

  function read() {
    try {
      const raw = localStorage.getItem(key);
      const parsed: unknown = raw === null ? fallback : JSON.parse(raw);
      snapshot = { value: validate(parsed) ? parsed : fallback, persistent: true };
    } catch {
      snapshot = { value: fallback, persistent: false };
    }
    initialized = true;
  }

  const getSnapshot = () => {
    if (typeof window !== "undefined" && !initialized) read();
    return snapshot;
  };

  function setValue(update: T | ((previous: T) => T)) {
    const previous = getSnapshot().value;
    const value = typeof update === "function" ? (update as (previous: T) => T)(previous) : update;
    let persistent = true;
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { persistent = false; }
    snapshot = { value, persistent };
    listeners.forEach((listener) => listener());
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    const onStorage = (event: StorageEvent) => {
      if (event.key === key || event.key === null) {
        read();
        listeners.forEach((notify) => notify());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => { listeners.delete(listener); window.removeEventListener("storage", onStorage); };
  }

  return { getSnapshot, getServerSnapshot: () => serverSnapshot, subscribe, setValue };
}
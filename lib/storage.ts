// ============================================================================
// STORAGE ADAPTER ABSTRACTION (LOCALSTORAGE + SERVERLESS POSTGRES HOOK)
// ============================================================================

export interface IStorageAdapter {
  loadState<T>(key: string, fallback: T): Promise<T>;
  saveState<T>(key: string, data: T): Promise<boolean>;
  clearState(key: string): Promise<boolean>;
  isAvailable(): boolean;
}

/**
 * LocalStorageAdapter: Production-ready browser persistence with memory fallback
 * for SSR and environments where localStorage is disabled or quota exceeded.
 */
export class LocalStorageAdapter implements IStorageAdapter {
  private memoryFallback: Map<string, string> = new Map();

  isAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const testKey = '__storage_test__';
      window.localStorage.setItem(testKey, testKey);
      window.localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  async loadState<T>(key: string, fallback: T): Promise<T> {
    if (!this.isAvailable()) {
      const memoryItem = this.memoryFallback.get(key);
      if (memoryItem) {
        try {
          return JSON.parse(memoryItem) as T;
        } catch {
          return fallback;
        }
      }
      return fallback;
    }

    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw) as T;
    } catch (err) {
      console.warn(`[LocalStorageAdapter] Failed to load key "${key}", using fallback:`, err);
      return fallback;
    }
  }

  async saveState<T>(key: string, data: T): Promise<boolean> {
    const serialized = JSON.stringify(data);

    if (!this.isAvailable()) {
      this.memoryFallback.set(key, serialized);
      return true;
    }

    try {
      window.localStorage.setItem(key, serialized);
      return true;
    } catch (err) {
      console.warn(`[LocalStorageAdapter] Failed to save key "${key}" to localStorage:`, err);
      this.memoryFallback.set(key, serialized);
      return false;
    }
  }

  async clearState(key: string): Promise<boolean> {
    if (!this.isAvailable()) {
      this.memoryFallback.delete(key);
      return true;
    }
    try {
      window.localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * PostgresStorageAdapter: Ready-to-wire hook for Supabase / Neon serverless PostgreSQL.
 * If endpoint or connection is not configured, automatically delegates to LocalStorageAdapter.
 */
export class PostgresStorageAdapter implements IStorageAdapter {
  private fallbackAdapter = new LocalStorageAdapter();
  private apiEndpoint: string;

  constructor(endpoint: string = '/api/storage') {
    this.apiEndpoint = endpoint;
  }

  isAvailable(): boolean {
    return typeof window !== 'undefined' && Boolean(process.env.NEXT_PUBLIC_POSTGRES_ENABLED);
  }

  async loadState<T>(key: string, fallback: T): Promise<T> {
    if (!this.isAvailable()) {
      return this.fallbackAdapter.loadState(key, fallback);
    }

    try {
      const res = await fetch(`${this.apiEndpoint}?key=${encodeURIComponent(key)}`);
      if (!res.ok) {
        return this.fallbackAdapter.loadState(key, fallback);
      }
      const data = await res.json();
      return (data?.value ?? fallback) as T;
    } catch (err) {
      console.warn(`[PostgresStorageAdapter] Fetch failed, falling back to local storage:`, err);
      return this.fallbackAdapter.loadState(key, fallback);
    }
  }

  async saveState<T>(key: string, data: T): Promise<boolean> {
    if (!this.isAvailable()) {
      return this.fallbackAdapter.saveState(key, data);
    }

    try {
      const res = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: data }),
      });
      if (!res.ok) {
        return this.fallbackAdapter.saveState(key, data);
      }
      return true;
    } catch (err) {
      console.warn(`[PostgresStorageAdapter] Save failed, fallback to local:`, err);
      return this.fallbackAdapter.saveState(key, data);
    }
  }

  async clearState(key: string): Promise<boolean> {
    if (!this.isAvailable()) {
      return this.fallbackAdapter.clearState(key);
    }
    try {
      const res = await fetch(`${this.apiEndpoint}?key=${encodeURIComponent(key)}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch {
      return this.fallbackAdapter.clearState(key);
    }
  }
}

/**
 * Storage factory returning the active adapter.
 */
export function getStorageAdapter(): IStorageAdapter {
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_STORAGE_MODE === 'postgres') {
    return new PostgresStorageAdapter();
  }
  return new LocalStorageAdapter();
}

// Some browsers (in-app WebViews with DOM storage disabled, strict privacy
// modes) throw on any localStorage access, which used to blank the whole app.
// Falls back to an in-memory map so the app keeps working for the session.
const memory = new Map<string, string>();

export const safeStorage = {
  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return memory.get(key) ?? null;
    }
  },
  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      memory.set(key, value);
    }
  },
  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      memory.delete(key);
    }
  },
};

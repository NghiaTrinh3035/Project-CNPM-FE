export const storage = {
  get<T>(key: string, fallback: T): T {
    try {
      const value = localStorage.getItem(key);
      if (!value) {
        return fallback;
      }
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  },
  set<T>(key: string, value: T) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  remove(key: string) {
    localStorage.removeItem(key);
  },
};

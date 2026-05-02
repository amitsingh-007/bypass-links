/**
 * Minimal Chrome extension API types for Playwright evaluate() contexts.
 * The `chrome` global is available natively in extension contexts (popup,
 * service worker, content scripts) but TypeScript doesn't know about it.
 *
 * Only declares APIs used in test code.
 */
declare const chrome: {
  storage: {
    local: {
      get(
        keys: string[] | string | null | Record<string, unknown>
      ): Promise<Record<string, unknown>>;
      set(items: Record<string, unknown>): Promise<void>;
      remove(keys: string | string[]): Promise<void>;
    };
  };
  history: {
    search(query: {
      text: string;
      maxResults: number;
      startTime: number;
    }): Promise<Array<{ url?: string }>>;
  };
};

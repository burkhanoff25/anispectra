export interface HttpClientOptions extends RequestInit {
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
  parseAs?: "json" | "text" | "blob";
}

export class HttpClient {
  /**
   * Generic core fetch function with timeouts, retries, and explicit error layers.
   */
  static async fetch<T>(url: string, options: HttpClientOptions = {}): Promise<T | null> {
    const {
      timeoutMs = 8000,
      retries = 2,
      retryDelayMs = 1000,
      parseAs = "json",
      ...fetchOptions
    } = options;

    let attempt = 0;
    while (attempt <= retries) {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(url, {
          ...fetchOptions,
          signal: controller.signal,
        });
        clearTimeout(id);

        if (!response.ok) {
          if (response.status >= 500 && attempt < retries) {
            throw new Error(`Server Error: ${response.status}`);
          }
          return null; // Return null on 404, 400, etc.
        }

        if (parseAs === "text") return (await response.text()) as unknown as T;
        if (parseAs === "blob") return (await response.blob()) as unknown as T;

        // JSON validation layer
        const text = await response.text();
        if (!text) return null;
        try {
          return JSON.parse(text) as T;
        } catch {
          return null;
        }
      } catch (err: unknown) {
        clearTimeout(id);
        const isAbort = err instanceof Error && err.name === "AbortError";
        if (attempt >= retries || (!isAbort && (err instanceof TypeError))) {
          // Allow retries for AbortError (timeout) or custom Server Error thrown above.
          // Network errors (TypeError) or out of retries -> return null to avoid crashing.
          return null;
        }
      }

      attempt++;
      await new Promise((res) => setTimeout(res, retryDelayMs * attempt));
    }
    return null;
  }
}

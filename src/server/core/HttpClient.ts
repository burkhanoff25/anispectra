export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}

export interface FetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export class HttpClient {
  static async fetch<T>(url: string, options: FetchOptions = {}): Promise<T> {
    const { timeout = 8000, retries = 3, retryDelay = 1000, ...fetchOptions } = options;

    let lastError: unknown;

    for (let attempt = 1; attempt <= retries; attempt++) {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await fetch(url, {
          ...fetchOptions,
          signal: controller.signal as RequestInit["signal"],
        });
        clearTimeout(id);

        if (!response.ok) {
          throw new AppError(response.status, `HTTP Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data as T;
      } catch (error: unknown) {
        clearTimeout(id);
        lastError = error;
        
        // Don't retry on 4xx client errors
        if (error instanceof AppError && error.statusCode >= 400 && error.statusCode < 500) {
          throw error;
        }

        if (attempt < retries) {
          await new Promise((res) => setTimeout(res, retryDelay * attempt));
        }
      }
    }

    throw new Error(`Failed after ${retries} attempts. Last error: ${lastError instanceof Error ? lastError.message : String(lastError)}`);
  }
}

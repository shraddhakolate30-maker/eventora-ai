export const DEFAULT_GEMINI_TIMEOUT_MS = 8000;

/**
 * Wraps a promise with an explicit timeout, clearing timer handles on resolution or rejection
 * to avoid event loop leakage.
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = DEFAULT_GEMINI_TIMEOUT_MS,
  operationName: string = 'Operation'
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${operationName} timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    promise
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withErrorHandler<T extends (...args: any[]) => Promise<void>>(fn: T): T {
  const wrapped = async (...args: Parameters<T>) => {
    try {
      await fn(...args);
    } catch (err) {
      if ((err as Error).name === 'ExitPromptError') {
        process.exit(0);
      }
      console.error(err);
      process.exit(1);
    }
  };
  return wrapped as T;
}

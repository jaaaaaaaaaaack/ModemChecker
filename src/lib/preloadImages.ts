/**
 * Preload images into the browser cache (best-effort).
 *
 * Resolves when every image has loaded/errored, the timeout elapses,
 * or the optional AbortSignal fires — whichever comes first.
 * Failures are swallowed: the goal is cache-warming, not validation.
 */
export function preloadImages(
  urls: string[],
  timeoutMs = 2000,
  signal?: AbortSignal,
): Promise<void> {
  if (urls.length === 0) return Promise.resolve();

  const imagePromises = urls.map(
    (url) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve(); // best-effort — don't reject
        img.src = url;
      }),
  );

  const timeout = new Promise<void>((resolve) => {
    setTimeout(resolve, timeoutMs);
  });

  const racers: Promise<void>[] = [
    Promise.all(imagePromises).then(() => {}),
    timeout,
  ];

  if (signal) {
    racers.push(
      new Promise<void>((resolve) => {
        if (signal.aborted) {
          resolve();
          return;
        }
        signal.addEventListener("abort", () => resolve(), { once: true });
      }),
    );
  }

  return Promise.race(racers);
}

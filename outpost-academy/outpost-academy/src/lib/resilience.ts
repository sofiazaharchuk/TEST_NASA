// Protection against the "blank screen after a new deployment / flaky network" problem.
// After a redeploy, an old open tab still asks for old hashed files (chunks) that no longer exist. Without protection React crashes
// and only the background stays. Here we retry once and then reload the page once (never in a loop).
export const isChunkError = (e: unknown) =>
  /dynamically imported module|Importing a module script failed|Loading chunk|Failed to fetch dynamically|error loading dynamically/i.test(String((e as { message?: string })?.message ?? e));

export function reloadOnce(): boolean {
  try {
    const last = Number(sessionStorage.getItem("oa.reload") ?? 0);
    if (Date.now() - last < 60_000) return false; // already tried in the last minute: do not loop
    sessionStorage.setItem("oa.reload", String(Date.now()));
  } catch { /* storage blocked: still try once */ }
  location.reload();
  return true;
}
/** Wrap `() => import("...")` so a failed download is retried, then triggers one safe reload. */
export function lazyRetry<T>(factory: () => Promise<T>): () => Promise<T> {
  return () => factory().catch(async () => {
    await new Promise(r => setTimeout(r, 400));
    try { return await factory(); } catch (e) {
      if (isChunkError(e) && reloadOnce()) return new Promise<T>(() => { /* page is reloading */ });
      throw e;
    }
  });
}
export function installGlobalHandlers() {
  window.addEventListener("vite:preloadError", e => { e.preventDefault(); reloadOnce(); });
  window.addEventListener("unhandledrejection", ev => { if (isChunkError(ev.reason)) { ev.preventDefault(); reloadOnce(); } });
}

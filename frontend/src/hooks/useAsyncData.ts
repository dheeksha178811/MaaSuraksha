import { useCallback, useEffect, useState } from 'react';

export type AsyncState<T> =
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string };

/**
 * Runs an async fetcher (e.g. a service-layer call) and tracks
 * loading/success/error state. Re-runs whenever `deps` changes, and again on
 * `reload()`. Written against a Promise-returning fetcher so pages built on
 * mock data today don't need to change when the fetcher is swapped for a
 * real `fetch('/api/...')` call later.
 */
export function useAsyncData<T>(fetcher: () => Promise<T>, deps: unknown[] = []): [AsyncState<T>, () => void] {
  const [state, setState] = useState<AsyncState<T>>({ status: 'loading' });
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let active = true;
    setState({ status: 'loading' });
    fetcher()
      .then((data) => {
        if (active) setState({ status: 'success', data });
      })
      .catch((error: unknown) => {
        // Every real service-layer error (AuthApiError/AuthNetworkError and
        // their per-service NotAuthenticatedError subclasses) carries a
        // specific, actionable message — e.g. "Unable to reach the
        // MaaSuraksha server. Please make sure the backend is running." or
        // "Sign in with your real account to view this data." Surfacing it
        // here (instead of a single hardcoded string for every failure) is
        // what lets a genuine outage be told apart from an auth problem or
        // an actual bug, rather than every case rendering identically.
        const message = error instanceof Error && error.message ? error.message : 'Something went wrong. Please try again.';
        if (active) setState({ status: 'error', message });
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadToken]);

  const reload = useCallback(() => setReloadToken((k) => k + 1), []);
  return [state, reload];
}

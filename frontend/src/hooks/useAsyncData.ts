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
      .catch(() => {
        if (active) setState({ status: 'error', message: 'Something went wrong. Please try again.' });
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadToken]);

  const reload = useCallback(() => setReloadToken((k) => k + 1), []);
  return [state, reload];
}

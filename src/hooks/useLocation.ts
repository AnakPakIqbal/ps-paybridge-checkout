import { useSyncExternalStore } from 'react';

// The hosted pages never navigate client-side: every link a merchant sends is a full page
// load, so the URL cannot change under a mounted page and there is nothing to subscribe
// to. useSyncExternalStore is still the right way to read it -- it keeps `window` out of
// render and gives a stable server snapshot -- with a subscription that never fires.
function subscribeToNothing(): () => void {
  return () => {
    // No client-side navigation exists, so there is never a listener to remove.
  };
}

export function useLocationPathname(): string {
  return useSyncExternalStore(
    subscribeToNothing,
    () => window.location.pathname,
    () => '/',
  );
}

export function useLocationHash(): string {
  return useSyncExternalStore(
    subscribeToNothing,
    () => window.location.hash,
    () => '',
  );
}

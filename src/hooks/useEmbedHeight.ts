import { useEffect } from 'react';

// Reports the page's own height to the embedding SDK, which sizes the iframe to match.
export function useEmbedHeight(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return;

    const report = () => {
      const height = Math.ceil(document.body.getBoundingClientRect().height);
      // Merchants only receive a number. frame-ancestors already limits the parent to the
      // App's embed origins, and the SDK checks origin and source before applying it.
      // eslint-disable-next-line sonarjs/post-message -- the parent's origin is not knowable here; the payload is only a height
      window.parent.postMessage({ type: 'paybridge:resize', height }, '*');
    };

    const observer = new ResizeObserver(report);
    observer.observe(document.body);
    return () => {
      observer.disconnect();
    };
  }, [enabled]);
}

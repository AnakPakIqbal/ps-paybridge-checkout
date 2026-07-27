import { useEffect, useRef, useState } from 'react';

import { loadScript } from '../utils/loadScript';

// Pinned to the latest published xendit-components-web version as of this writing
// (npm view xendit-components-web versions). Verified reachable via curl — the CDN
// path requires a "v"-prefixed version, "latest" is not a valid alias.
// Bump this when upgrading; check npm for newer versions periodically.
const XENDIT_COMPONENTS_SCRIPT_URL = 'https://assets.xendit.co/components/v0.0.25/index.umd.js';
const XENDIT_COMPONENTS_SCRIPT_ID = 'xendit-components-script';

interface XenditChannel {
  code: string;
}

interface XenditComponentsInstance {
  getActiveChannels: (filter: { filter: string }) => XenditChannel[];
  createChannelComponent: (channel: XenditChannel) => HTMLElement;
  createActionContainerComponent: () => HTMLElement;
  submit: () => void;
  addEventListener: (event: string, handler: () => void) => void;
  removeEventListener?: (event: string, handler: () => void) => void;
  unmount?: () => void;
}

declare global {
  interface Window {
    // The UMD bundle sets globalThis.Xendit = {...exports}, so the constructor lives at
    // window.Xendit.XenditComponents — not window.XenditComponents directly (verified by
    // inspecting the published bundle's UMD wrapper and its named exports).
    Xendit?: {
      XenditComponents: new (opts: {
        componentsSdkKey: string;
        iframeFieldAppearance?: {
          inputStyles?: Record<string, string>;
          placeholderStyles?: Record<string, string>;
        };
      }) => XenditComponentsInstance;
    };
  }
}

interface XenditCardComponentProps {
  componentsSdkKey: string;
  onComplete: () => void;
  onError: (message: string) => void;
}

// Mounts Xendit's own embedded card UI (iframe-based fields) for tokenized card
// payments — raw card data is entered directly into Xendit's fields and never touches
// our JS or backend. Replaces the custom CardForm used for Midtrans, which has no
// equivalent concept and is unaffected by this component.
export default function XenditCardComponent({
  componentsSdkKey,
  onComplete,
  onError,
}: Readonly<XenditCardComponentProps>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const actionContainerRef = useRef<HTMLDivElement>(null);
  const componentsRef = useRef<XenditComponentsInstance | null>(null);
  const [ready, setReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /* eslint-disable react-doctor/effect-needs-cleanup -- false positive: the
     registrations below happen inside the nested async `mount()`, but the returned
     cleanup does release every one of them via the `listeners` array populated at the
     same call sites, plus `unmount()` on the SDK instance itself. */
  useEffect(() => {
    let cancelled = false;
    // Populated once the SDK mounts, so the cleanup below can unsubscribe the exact
    // handler instances it registered — `unmount?.()` alone isn't guaranteed by the
    // SDK's contract to also remove these listeners.
    const listeners: { event: string; handler: () => void }[] = [];

    const onSubmissionReady = () => {
      if (!cancelled) setReady(true);
    };
    const onActionBegin = () => {
      const components = componentsRef.current;
      if (components && actionContainerRef.current && !actionContainerRef.current.hasChildNodes()) {
        actionContainerRef.current.appendChild(components.createActionContainerComponent());
      }
    };
    const onSessionComplete = () => {
      if (!cancelled) onComplete();
    };

    const mount = async () => {
      try {
        await loadScript(XENDIT_COMPONENTS_SCRIPT_ID, XENDIT_COMPONENTS_SCRIPT_URL);
        if (cancelled || !window.Xendit || !containerRef.current) return;

        const components = new window.Xendit.XenditComponents({
          componentsSdkKey,
          iframeFieldAppearance: {
            inputStyles: { color: '#0b1a3a', fontFamily: '"Plus Jakarta Sans", sans-serif' },
            placeholderStyles: { color: '#5b6a8c' },
          },
        });
        componentsRef.current = components;

        // getActiveChannels/createChannelComponent throw until the session's world
        // state has loaded — the SDK signals that via an `init` event fired once,
        // asynchronously, after construction. Wire this before anything else so we
        // never race it (verified against the SDK's own assertInitialized() message).
        const onInit = () => {
          if (cancelled || !containerRef.current) return;
          try {
            const [cardChannel] = components.getActiveChannels({ filter: 'CARDS' });
            if (!cardChannel) {
              onError('Card payment is not available for this session.');
              return;
            }

            const cardField = components.createChannelComponent(cardChannel);
            containerRef.current.appendChild(cardField);
          } catch (err) {
            onError(err instanceof Error ? err.message : 'Failed to render the card form.');
          }
        };

        components.addEventListener('init', onInit);
        components.addEventListener('submission-ready', onSubmissionReady);
        components.addEventListener('action-begin', onActionBegin);
        components.addEventListener('session-complete', onSessionComplete);
        listeners.push(
          { event: 'init', handler: onInit },
          { event: 'submission-ready', handler: onSubmissionReady },
          { event: 'action-begin', handler: onActionBegin },
          { event: 'session-complete', handler: onSessionComplete },
        );
      } catch (err) {
        onError(err instanceof Error ? err.message : 'Failed to load the card payment form.');
      }
    };

    void mount();

    return () => {
      cancelled = true;
      listeners.forEach(({ event, handler }) => {
        componentsRef.current?.removeEventListener?.(event, handler);
      });
      componentsRef.current?.unmount?.();
      componentsRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [componentsSdkKey]);
  /* eslint-enable react-doctor/effect-needs-cleanup */

  return (
    <div className="flex flex-col gap-4">
      <div ref={containerRef} className="min-h-[120px]" />
      <div ref={actionContainerRef} />
      <button
        type="button"
        disabled={!ready || submitting}
        onClick={() => {
          setSubmitting(true);
          componentsRef.current?.submit();
        }}
        className="w-full bg-brand text-white font-semibold rounded-xl py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
      >
        {submitting ? 'Processing...' : 'Pay'}
      </button>
    </div>
  );
}

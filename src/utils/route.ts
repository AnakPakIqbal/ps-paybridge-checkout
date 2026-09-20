// The hosted pages are one SPA served from several server-side paths (the Express app
// returns the same HTML shell for each), so the page to show is decided here from
// window.location.pathname. There is no client-side navigation between them: every link
// a merchant sends is a full page load.

export const HOSTED_PAGE = {
  CHECKOUT: 'checkout',
  REFUND: 'refund',
  SUBSCRIPTION: 'subscription',
} as const;

type HostedPage = (typeof HOSTED_PAGE)[keyof typeof HOSTED_PAGE];

export interface HostedRoute {
  page: HostedPage;
  // The session id segment after the page root, or null when the path has none.
  id: string | null;
}

const ROOT_TO_PAGE: Record<string, HostedPage | undefined> = {
  refund: HOSTED_PAGE.REFUND,
  subscription: HOSTED_PAGE.SUBSCRIPTION,
};

/**
 * Anything that is not a recognised page root resolves to the checkout page, exactly as
 * before routing existed: the checkout page reports its own "session id is missing"
 * error, so /checkout/, /checkout/:id and an unknown path all keep behaving as they did.
 */
export function resolveRoute(pathname: string): HostedRoute {
  const [root, id] = pathname.split('/').filter(Boolean);
  const page = (root ? ROOT_TO_PAGE[root] : undefined) ?? HOSTED_PAGE.CHECKOUT;
  return { page, id: id ?? null };
}

/**
 * The refund token travels in the URL fragment (never the path or query), so it is not
 * sent to the server on the page load and does not land in access logs.
 */
export function readFragmentToken(hash: string): string | null {
  const match = /token=([^&]+)/.exec(hash);
  return match?.[1] ?? null;
}

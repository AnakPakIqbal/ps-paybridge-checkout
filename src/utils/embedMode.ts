// The PayBridge SDK adds `details=0` to the URL fragment (next to the token) when the
// merchant did not ask for the full layout. It is only honoured inside an iframe, so a
// checkout link opened on its own always shows the full page.
const COMPACT_FRAGMENT = /(?:^#|&)details=0(?:&|$)/;

export function isCompactEmbed(): boolean {
  return window.self !== window.top && COMPACT_FRAGMENT.test(window.location.hash);
}

import { useLocationPathname } from './hooks/useLocation';
import CheckoutPage from './pages/CheckoutPage';
import RefundPage from './pages/RefundPage';
import SubscriptionPage from './pages/SubscriptionPage';
import { HOSTED_PAGE, resolveRoute } from './utils/route';

// One SPA, several server-side entry paths (see utils/route.ts). Anything that is not a
// recognised page root falls through to the checkout page, exactly as before routing
// existed.
export default function App() {
  const { page } = resolveRoute(useLocationPathname());

  if (page === HOSTED_PAGE.REFUND) return <RefundPage />;
  if (page === HOSTED_PAGE.SUBSCRIPTION) return <SubscriptionPage />;
  return <CheckoutPage />;
}

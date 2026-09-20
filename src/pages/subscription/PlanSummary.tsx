import type { SubscriptionSessionView } from '../../types/subscription';

import SummaryRows, { type SummaryRow } from '../../molecules/SummaryRows';
import { formatCurrency } from '../../utils/formatCurrency';
import {
  formatBillingDate,
  formatBillingInterval,
  formatTotalRecurrence,
} from '../../utils/formatSubscription';

interface PlanSummaryProps {
  view: SubscriptionSessionView;
  // Create mode shows the FIRST payment date (the plan's anchor); an existing subscription
  // shows the NEXT one. Both come from the server; this only picks the label.
  dateLabel: string;
  date: string | null;
}

export default function PlanSummary({ view, dateLabel, date }: Readonly<PlanSummaryProps>) {
  const { plan } = view;
  const length = formatTotalRecurrence(plan.totalRecurrence);

  const rows: SummaryRow[] = [
    ...(plan.description ? [{ label: 'Plan', value: plan.description }] : []),
    {
      label: 'Price',
      value: `${formatCurrency(plan.amount, plan.currency)} ${formatBillingInterval(plan.interval, plan.intervalCount)}`,
      emphasized: true,
    },
    ...(date ? [{ label: dateLabel, value: formatBillingDate(date) }] : []),
    { label: 'Length', value: length ?? 'Until you cancel' },
  ];

  return <SummaryRows rows={rows} />;
}

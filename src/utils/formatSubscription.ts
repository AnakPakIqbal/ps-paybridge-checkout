const INTERVAL_UNIT: Record<string, string> = {
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
  YEAR: 'year',
};

/** "every month", "every 3 months", "every week". Falls back to the raw value, never blank. */
export function formatBillingInterval(interval: string, intervalCount: number): string {
  const unit = INTERVAL_UNIT[interval];
  if (!unit) return `every ${String(intervalCount)} ${interval.toLowerCase()}`;
  return intervalCount === 1 ? `every ${unit}` : `every ${String(intervalCount)} ${unit}s`;
}

// The anchor is a calendar day in Asia/Jakarta (the backend caps it at day 28 there), so a
// billing date is shown in that zone too -- rendering it in the customer's own zone could
// put it on a different day than the merchant and the provider mean.
const BILLING_DATE_FORMATTER = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'long',
  timeZone: 'Asia/Jakarta',
});

export function formatBillingDate(iso: string): string {
  return BILLING_DATE_FORMATTER.format(new Date(iso));
}

/** "12 payments" for a fixed-length plan, null for one that continues until cancelled. */
export function formatTotalRecurrence(totalRecurrence: number | null): string | null {
  if (totalRecurrence === null) return null;
  return totalRecurrence === 1 ? '1 payment' : `${String(totalRecurrence)} payments`;
}

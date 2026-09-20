type SubscriptionStep = 'activating' | 'active' | 'canceled';

interface SubscriptionTimelineProps {
  currentStep: SubscriptionStep;
  nextBillingDate: string | null;
}

export default function SubscriptionTimeline({
  currentStep,
  nextBillingDate,
}: Readonly<SubscriptionTimelineProps>) {
  if (currentStep === 'canceled') {
    return (
      <div className="w-full bg-panel2/60 border border-lineSoft rounded-xl p-4 my-4">
        <div className="flex items-center gap-2 text-xs text-amber-600 font-semibold mb-1">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          Subscription Terminated
        </div>
        <p className="text-xs text-muted">
          All future automatic payments have been disabled. No further charges will occur.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-panel2/60 border border-lineSoft rounded-xl p-4 my-4">
      <div className="text-xs font-semibold text-text mb-3 flex items-center justify-between">
        <span>Subscription Status & Timeline</span>
        <span className="text-[11px] text-brand font-medium">Auto-renew active</span>
      </div>

      <div className="relative flex items-center justify-between">
        {/* Connecting line */}
        <div className="absolute left-4 right-4 top-3.5 -translate-y-1/2 h-0.5 bg-lineSoft -z-0" />

        {/* Step 1 */}
        <div className="flex flex-col items-center text-center relative z-10">
          <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">
            ✓
          </div>
          <span className="text-[11px] font-medium text-text mt-1.5">Card Saved</span>
          <span className="text-[10px] text-emerald-600 font-medium">Saved</span>
        </div>

        {/* Step 2 */}
        <div className="flex flex-col items-center text-center relative z-10">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-xs ${
              currentStep === 'active'
                ? 'bg-brand text-white ring-4 ring-brandSoft/50'
                : 'bg-amber-500 text-white animate-pulse'
            }`}
          >
            {currentStep === 'active' ? '✓' : '⟳'}
          </div>
          <span className="text-[11px] font-medium text-text mt-1.5">Active</span>
          <span className="text-[10px] text-muted">Current Cycle</span>
        </div>

        {/* Step 3 */}
        <div className="flex flex-col items-center text-center relative z-10">
          <div className="w-7 h-7 rounded-full bg-panel border-2 border-line text-muted flex items-center justify-center text-xs font-bold shadow-xs">
            3
          </div>
          <span className="text-[11px] font-medium text-muted mt-1.5">Next Renewal</span>
          <span className="text-[10px] text-brand font-medium">
            {nextBillingDate ? 'Scheduled' : 'Ongoing'}
          </span>
        </div>
      </div>
    </div>
  );
}

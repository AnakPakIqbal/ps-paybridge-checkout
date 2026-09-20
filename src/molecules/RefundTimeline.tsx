type RefundStep = 'ready' | 'processing' | 'completed';

interface RefundTimelineProps {
  currentStep: RefundStep;
}

function getProgressLabel(step: RefundStep): string {
  if (step === 'completed') return 'Completed';
  if (step === 'processing') return 'In Progress';
  return 'Awaiting Confirmation';
}

function getStep2Class(step: RefundStep): string {
  if (step === 'completed') return 'bg-emerald-500 text-white';
  if (step === 'processing') return 'bg-brand text-white ring-4 ring-brandSoft/50 animate-pulse';
  return 'bg-panel border-2 border-line text-muted';
}

function getStep2Icon(step: RefundStep): string {
  if (step === 'completed') return '✓';
  if (step === 'processing') return '⟳';
  return '2';
}

function getStep2Status(step: RefundStep): string {
  if (step === 'completed') return 'Accepted';
  if (step === 'processing') return 'Processing';
  return 'Pending';
}

export default function RefundTimeline({ currentStep }: Readonly<RefundTimelineProps>) {
  return (
    <div className="w-full bg-panel2/60 border border-lineSoft rounded-xl p-4 my-4">
      <div className="text-xs font-semibold text-text mb-3 flex items-center justify-between">
        <span>Refund Progress</span>
        <span className="text-[11px] text-brand font-medium">
          {getProgressLabel(currentStep)}
        </span>
      </div>

      <div className="relative flex items-center justify-between">
        {/* Progress bar background line */}
        <div className="absolute left-4 right-4 top-3.5 -translate-y-1/2 h-0.5 bg-lineSoft -z-0" />

        {/* Step 1: Approved */}
        <div className="flex flex-col items-center text-center relative z-10">
          <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">
            ✓
          </div>
          <span className="text-[11px] font-medium text-text mt-1.5">Approved</span>
          <span className="text-[10px] text-emerald-600 font-medium">By Merchant</span>
        </div>

        {/* Step 2: Processing */}
        <div className="flex flex-col items-center text-center relative z-10">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-xs ${getStep2Class(
              currentStep,
            )}`}
          >
            {getStep2Icon(currentStep)}
          </div>
          <span className="text-[11px] font-medium text-text mt-1.5">Gateway</span>
          <span className="text-[10px] text-muted">{getStep2Status(currentStep)}</span>
        </div>

        {/* Step 3: Account Credit */}
        <div className="flex flex-col items-center text-center relative z-10">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-xs ${
              currentStep === 'completed'
                ? 'bg-emerald-500 text-white ring-4 ring-emerald-100'
                : 'bg-panel border-2 border-line text-muted'
            }`}
          >
            {currentStep === 'completed' ? '✓' : '3'}
          </div>
          <span className="text-[11px] font-medium text-muted mt-1.5">Your Bank</span>
          <span className="text-[10px] text-brand font-medium">
            {currentStep === 'completed' ? 'Sent to your bank' : 'Timing varies'}
          </span>
        </div>
      </div>
    </div>
  );
}

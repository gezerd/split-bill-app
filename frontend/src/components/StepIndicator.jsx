const STEPS = ['Upload', 'Assign', 'Tax & Tip', 'Done'];

export default function StepIndicator({ currentStep }) {
  return (
    <div className="flex items-center w-full">
      {STEPS.map((label, index) => {
        const stepNum = index + 1;
        const isCompleted = stepNum < currentStep;
        const isActive = stepNum === currentStep;

        return (
          <div key={stepNum} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  isCompleted || isActive
                    ? 'bg-accent text-on-accent'
                    : 'bg-surface-2 text-gray-400'
                }`}
              >
                {isCompleted ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  stepNum
                )}
              </div>
              <span
                className={`mt-1 text-xs font-medium whitespace-nowrap ${
                  isActive ? 'text-accent' : isCompleted ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                {label}
              </span>
            </div>

            {index < STEPS.length - 1 && (
              <div
                className={`flex-1 h-px mx-2 mb-4 ${
                  isCompleted ? 'bg-accent' : 'bg-surface-2'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

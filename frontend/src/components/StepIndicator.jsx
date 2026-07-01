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
                className={`flex items-center justify-center transition-all font-extrabold ${
                  isCompleted || isActive ? 'bg-accent' : 'bg-surface-2'
                }`}
                style={{
                  width: 34, height: 34, borderRadius: '50%',
                  fontSize: 13,
                  color: isCompleted || isActive ? '#111' : '#7AAAB8',
                  boxShadow: isActive ? '0 0 0 5px #00FDDC26' : undefined,
                  transition: '0.35s cubic-bezier(0.4,0,0.2,1)',
                }}
              >
                {isCompleted || (isActive && stepNum === 4) ? '✓' : stepNum}
              </div>
              <span
                style={{
                  marginTop: 7,
                  fontSize: 11,
                  whiteSpace: 'nowrap',
                  fontWeight: isActive ? 700 : 400,
                  color: isActive ? '#00FDDC' : isCompleted ? '#A0C4DC' : '#7AAAB8',
                  transition: 'color 0.3s',
                }}
              >
                {label}
              </span>
            </div>

            {index < STEPS.length - 1 && (
              <div
                className="flex-1 mb-4 mx-2"
                style={{
                  height: 2,
                  background: isCompleted ? '#00FDDC' : '#2E5674',
                  transition: 'background 0.35s',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

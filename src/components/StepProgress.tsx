import React from 'react';

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  title?: string;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

const StepProgress: React.FC<StepProgressProps> = ({
  currentStep,
  totalSteps,
  title = "Completamento del profilo",
  className = "",
  size = 'medium'
}) => {
  const percentage = (currentStep / totalSteps) * 100;
  
  // Size configurations
  const sizeConfig = {
    small: { circle: 'w-12 h-12', stroke: '4', text: 'text-sm' },
    medium: { circle: 'w-18 h-18', stroke: '7', text: 'text-base' },
    large: { circle: 'w-24 h-24', stroke: '8', text: 'text-lg' }
  };
  
  const config = sizeConfig[size];

  return (
    <div className={`bg-[#fafafb] p-6 rounded-lg flex space-x-6 ${className}`}>
      {/* SVG Version */}
      <div className={`${config.circle} transform rotate-45`}>
        <svg 
          className="w-full h-full -rotate-45" 
          viewBox="0 0 72 72"
        >
          {/* Background circle */}
          <circle
            cx="36"
            cy="36"
            r="32"
            fill="none"
            stroke="#C2C9FF"
            strokeWidth={config.stroke}
          />
          {/* Progress circle */}
          <circle
            cx="36"
            cy="36"
            r="32"
            fill="none"
            stroke="currentColor"
            strokeWidth={config.stroke}
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 32}`}
            strokeDashoffset={`${2 * Math.PI * 32 * (1 - percentage / 100)}`}
            className="text-primary transition-all duration-300 ease-in-out"
            transform="rotate(-90 36 36)"
          />
        </svg>
      </div>
      
      <div className="space-y-2">
        <h4 className={`text-secondary ${config.text}`}>{title}</h4>
        <span className={config.text}>Step {currentStep}/{totalSteps}</span>
      </div>
    </div>
  );
};

// Alternative CSS-only version
export const StepProgressCSS: React.FC<StepProgressProps> = ({
  currentStep,
  totalSteps,
  title = "Completamento del profilo",
  className = "",
  size = 'medium'
}) => {
  const percentage = (currentStep / totalSteps) * 100;
  
  const sizeConfig = {
    small: { circle: 'w-12 h-12', border: 'border-4' },
    medium: { circle: 'w-18 h-18', border: 'border-7' },
    large: { circle: 'w-24 h-24', border: 'border-8' }
  };
  
  const config = sizeConfig[size];

  return (
    <div className={`bg-[#fafafb] p-6 rounded-lg flex space-x-6 ${className}`}>
      <div className={`relative ${config.circle} rotate-45`}>
        {/* Background circle */}
        <div className={`${config.circle} aspect-square ${config.border} rounded-full border-[#C2C9FF] absolute top-0 left-0`}></div>
        {/* Progress circle with dynamic conic gradient */}
        <div 
          className={`${config.circle} aspect-square ${config.border} rounded-full border-transparent absolute top-0 left-0`}
          style={{
            background: `conic-gradient(from 0deg, var(--color-primary) ${percentage}%, transparent ${percentage}%)`,
            WebkitMask: `radial-gradient(circle at center, transparent 50%, black 50%)`,
            mask: `radial-gradient(circle at center, transparent 50%, black 50%)`
          }}
        ></div>
      </div>
      
      <div className="space-y-2">
        <h4 className="text-secondary">{title}</h4>
        <span>Step {currentStep}/{totalSteps}</span>
      </div>
    </div>
  );
};

export default StepProgress;
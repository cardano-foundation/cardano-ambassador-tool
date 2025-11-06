import { TimelineProps, TimelineStatus, TimelineStep } from '@types';
import React from 'react';
import { CardanoIcon } from './CardanoIcon';

const TimelineItem: React.FC<{
  step: TimelineStep;
  index: number;
  isLast: boolean;
  onClick?: (stepId: string, stepIndex: number) => void;
  clickable?: boolean;
}> = ({ step, index, isLast, onClick, clickable }) => {
  const isCompleted = step.status === 'completed';
  const isCurrent = step.status === 'current';
  const isPending = step.status === 'pending';

  const handleClick = () => {
    if (clickable && onClick) {
      onClick(step.id, index);
    }
  };

  const getStepCircleClasses = () => {
    const base = `
      w-11 h-11 rounded-full flex items-center justify-center 
      transition-all duration-300 ease-in-out
      ${clickable ? 'cursor-pointer hover:scale-105' : ''}
    `;

    if (isCompleted) {
      return `${base} bg-primary-base shadow-lg`;
    }
    if (isCurrent) {
      return `${base} bg-background border-1 border-primary-base`;
    }
    return `${base} bg-background border-1 border-border`;
  };

  const getIconColor = () => {
    if (isCompleted) {
      return 'white';
    }
    if (isCurrent) {
      return '#DC2626';
    }
    return '#9CA3AF';
  };

  const getLineClasses = () => {
    const base = 'w-px transition-colors duration-300';
    if (isCompleted || isCurrent) {
      return `${base} bg-primary-base`;
    }
    return `${base} bg-gray-300`;
  };

  return (
    <div className={`relative flex items-start ${clickable ? 'group' : ''}`}>
      {!isLast && (
        <div
          className={`absolute top-11 left-5 w-0.5 ${getLineClasses()}`}
          style={{ height: 'calc(100% - 44px)' }}
        />
      )}

      <div
        className={`${getStepCircleClasses()} relative z-10 flex-shrink-0`}
        onClick={clickable ? handleClick : undefined}
      >
        <CardanoIcon size={25} color={getIconColor()} />
      </div>

      <div
        className={`ml-4 pb-8 flex-1 min-w-0 ${clickable ? 'cursor-pointer' : ''}`}
        onClick={clickable ? handleClick : undefined}
      >
        <div
          className={`text-foreground text-base font-medium mb-3 ${clickable ? 'group-hover:text-primary' : ''} `}
        >
          {step.title}
        </div>
        <div className="w-full">
          {step.content}
        </div>
      </div>
    </div>
  );
};

export const Timeline: React.FC<TimelineProps> = ({
  steps,
  className = '',
  onStepClick,
  clickable = false,
}) => {
  const currentStepIndex = steps.findIndex((step) => step.status === 'current');
  const correctedSteps =
    currentStepIndex !== -1
      ? steps.map((step, index) => {
          if (index < currentStepIndex) {
            return { ...step, status: 'completed' as TimelineStatus };
          } else if (index === currentStepIndex) {
            return { ...step, status: 'current' as TimelineStatus };
          } else {
            return { ...step, status: 'pending' as TimelineStatus };
          }
        })
      : steps;

  return (
    <div className={`flex flex-col ${className}`}>
      {correctedSteps.map((step, index) => (
        <TimelineItem
          key={step.id}
          step={step}
          index={index}
          isLast={index === steps.length - 1}
          onClick={onStepClick}
          clickable={clickable}
        />
      ))}
    </div>
  );
};

export default Timeline;

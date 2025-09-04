import { cn } from '@/utils/utils';
import { useState } from 'react';

interface StepItem {
  id: string | number;
  label?: string;
  completed?: boolean;
  disabled?: boolean;
  onClick?: (step: StepItem, rowIndex: number, stepIndex: number) => void;
}

interface StepperRow {
  id: string | number;
  steps: StepItem[];
  activeStepId?: string | number;
}

interface StepperProps {
  rows?: StepperRow[];
  steps?: number[][];
  totalStepsPerRow?: number;
  activeStepIds?: (string | number)[];
  onStepClick?: (step: StepItem, rowIndex: number, stepIndex: number) => void;
  onActiveStepChange?: (
    rowIndex: number,
    stepId: string | number,
    step: StepItem,
  ) => void;
  className?: string;
  activeColor?: string;
  completedColor?: string;
  inactiveColor?: string;
  disabledColor?: string;
  gap?: string;
  stepHeight?: string;
  clickable?: boolean;
}

export default function Stepper({
  rows,
  steps = [[0], [2]],
  totalStepsPerRow = 7,
  activeStepIds,
  onStepClick,
  onActiveStepChange,
  className,
  activeColor = 'bg-primary-base',
  completedColor = 'bg-primary-300',
  inactiveColor = 'bg-neutral-200 dark:bg-zinc-500',
  disabledColor = 'bg-neutral-100 dark:bg-zinc-700',
  gap = 'gap-[5px]',
  stepHeight = 'h-2',
  clickable = false,
}: StepperProps) {
  const [currentActiveStepIds, setCurrentActiveStepIds] = useState<
    (string | number)[]
  >(activeStepIds || []);

  const handleStepClick = (
    step: StepItem,
    rowIndex: number,
    stepIndex: number,
  ) => {
    if (step.disabled || !clickable) return;

    setCurrentActiveStepIds((prev) => {
      const newIds = [...prev];
      newIds[rowIndex] = step.id;
      return newIds;
    });

    onActiveStepChange?.(rowIndex, step.id, step);
    step.onClick?.(step, rowIndex, stepIndex);
    onStepClick?.(step, rowIndex, stepIndex);
  };

  if (rows) {
    return (
      <div className={cn('flex flex-col gap-4', className)}>
        {rows.map((row, rowIndex) => (
          <div
            key={row.id}
            className={cn('inline-flex items-start justify-center', gap)}
          >
            {row.steps.map((step, stepIndex) => {
              const isActive =
                (currentActiveStepIds[rowIndex] || row.activeStepId) ===
                step.id;
              const isCompleted = step.completed;
              const isDisabled = step.disabled;

              return (
                <div
                  key={step.id}
                  onClick={() => handleStepClick(step, rowIndex, stepIndex)}
                  className={cn(
                    stepHeight,
                    'rounded-[30px] transition-all duration-300',
                    clickable &&
                      !isDisabled &&
                      'cursor-pointer hover:scale-110',
                    isDisabled && 'cursor-not-allowed',
                    isActive
                      ? `w-5 ${activeColor}`
                      : isCompleted
                        ? `w-3 ${completedColor}`
                        : isDisabled
                          ? `w-2 ${disabledColor}`
                          : `w-2 ${inactiveColor}`,
                  )}
                  title={step.label || `Step ${stepIndex + 1}`}
                />
              );
            })}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {steps.map((rowActiveSteps, rowIndex) => (
        <div
          key={rowIndex}
          className={cn('inline-flex items-start justify-center', gap)}
        >
          {Array.from({ length: totalStepsPerRow }, (_, stepIndex) => {
            const isActive = rowActiveSteps.includes(stepIndex);
            return (
              <div
                key={stepIndex}
                className={cn(
                  stepHeight,
                  'rounded-[30px] transition-all duration-300',
                  isActive ? `w-5 ${activeColor}` : `w-2 ${inactiveColor}`,
                )}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

export function SingleRowStepper({
  currentStep = 0,
  totalSteps = 7,
  stepLabels = [],
  onStepClick,
  clickable = false,
  className,
  ...props
}: {
  currentStep?: number;
  totalSteps?: number;
  stepLabels?: string[];
  onStepClick?: (stepIndex: number) => void;
  clickable?: boolean;
  className?: string;
} & Omit<Partial<StepperProps>, 'onStepClick'>) {
  const stepItems: StepItem[] = Array.from(
    { length: totalSteps },
    (_, index) => ({
      id: index,
      label: stepLabels[index] || `Step ${index + 1}`,
      completed: index < currentStep,
      onClick: onStepClick ? () => onStepClick(index) : undefined,
    }),
  );

  const rows: StepperRow[] = [
    {
      id: 'single-row',
      steps: stepItems,
      activeStepId: currentStep,
    },
  ];

  return (
    <Stepper
      rows={rows}
      clickable={clickable}
      className={className}
      {...props}
    />
  );
}

export function useStepper(totalRows: number, totalStepsPerRow: number) {
  const [activeSteps, setActiveSteps] = useState<number[][]>(
    Array(totalRows)
      .fill([])
      .map(() => []),
  );

  const setActiveStep = (row: number, step: number) => {
    setActiveSteps((prev) => {
      const newSteps = [...prev];
      newSteps[row] = [step];
      return newSteps;
    });
  };

  const nextStep = (row: number) => {
    setActiveSteps((prev) => {
      const newSteps = [...prev];
      const currentActive = newSteps[row][0] || 0;
      if (currentActive < totalStepsPerRow - 1) {
        newSteps[row] = [currentActive + 1];
      }
      return newSteps;
    });
  };

  const prevStep = (row: number) => {
    setActiveSteps((prev) => {
      const newSteps = [...prev];
      const currentActive = newSteps[row][0] || 0;
      if (currentActive > 0) {
        newSteps[row] = [currentActive - 1];
      }
      return newSteps;
    });
  };

  const reset = () => {
    setActiveSteps(
      Array(totalRows)
        .fill([])
        .map(() => []),
    );
  };

  return {
    activeSteps,
    setActiveStep,
    nextStep,
    prevStep,
    reset,
  };
}

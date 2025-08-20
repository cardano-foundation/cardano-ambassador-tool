import React from 'react';
import { X } from "lucide-react";
import { cn } from '@/utils/utils';
import Button from './Button';

interface ModalAction {
  label: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'warning' | 'success' | 'primary-light';
  onClick: () => void;
}

interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  title: string;
  message: string;
  actions?: ModalAction[];
  showCloseButton?: boolean;
  className?: string;
}

export function useModal() {
  const [isOpen, setIsOpen] = React.useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return {
    isOpen,
    openModal,
    closeModal,
  };
}

export default function Modal({
  isOpen,
  onClose,
  title,
  message,
  actions = [],
  showCloseButton = true,
  className,
}: ModalProps) {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-70"
      onClick={handleOverlayClick}
    >
      <div className={cn(
        "px-5 py-3.5 bg-background rounded-xl shadow-[0px_3px_4px_0px_rgba(0,0,0,0.03)] outline outline-1 outline-offset-[-1px] outline-neutral-200 inline-flex flex-col justify-start items-end gap-5 overflow-hidden max-w-sm w-full mx-4",
        className
      )}>
        {showCloseButton && (
          <div className="p-1 inline-flex justify-start items-start gap-2.5">
            <button
              onClick={onClose}
              className="w-6 h-6 flex items-center justify-center text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer rounded-full hover:bg-neutral-100"
              aria-label="close"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        )}

        <div className="self-stretch flex flex-col justify-start items-start gap-3.5">
          <div className="inline-flex justify-center items-start gap-3.5 w-full">
            <div className="self-stretch inline-flex flex-col justify-center items-center gap-[5px] flex-1">
              <div className="w-full inline-flex justify-center items-start">
                <div className="justify-start text-neutral-900 text-xl font-bold  leading-7">
                  {title}
                </div>
              </div>

              <div className="self-stretch text-center justify-start text-neutral-700 text-base font-normal font-['Chivo'] leading-normal">
                {message}
              </div>
            </div>
          </div>

          {actions.length > 0 && (
            <div className="self-stretch inline-flex justify-center items-start gap-3">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || 'primary'}
                  size="sm"
                  className="flex-1 h-9"
                  onClick={action.onClick}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
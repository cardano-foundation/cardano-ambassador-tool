import { cn } from '@/utils/utils';
import { X } from 'lucide-react';
import React from 'react';
import Button from './Button';

interface ModalAction {
  label: string;
  variant?:
    | 'primary'
    | 'secondary'
    | 'outline'
    | 'ghost'
    | 'warning'
    | 'success'
    | 'primary-light';
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
      className="bg-opacity-70 fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleOverlayClick}
    >
      <div
        className={cn(
          'bg-background mx-4 inline-flex w-full max-w-sm flex-col items-end justify-start gap-5 overflow-hidden rounded-xl px-5 py-3.5 shadow-[0px_3px_4px_0px_rgba(0,0,0,0.03)] outline outline-1 outline-offset-[-1px] outline-neutral-200',
          className,
        )}
      >
        {showCloseButton && (
          <div className="inline-flex items-start justify-start gap-2.5 p-1">
            <button
              onClick={onClose}
              className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
              aria-label="close"
            >
              <X className="text-muted-foreground h-4 w-4" />
            </button>
          </div>
        )}

        <div className="flex flex-col items-start justify-start gap-3.5 self-stretch">
          <div className="inline-flex w-full items-start justify-center gap-3.5">
            <div className="inline-flex flex-1 flex-col items-center justify-center gap-[5px] self-stretch">
              <div className="inline-flex w-full items-start justify-center">
                <div className="justify-start text-xl leading-7 font-bold text-neutral-900">
                  {title}
                </div>
              </div>

              <div className="justify-start self-stretch text-center font-['Chivo'] text-base leading-normal font-normal text-neutral-700">
                {message}
              </div>
            </div>
          </div>

          {actions.length > 0 && (
            <div className="inline-flex items-start justify-center gap-3 self-stretch">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || 'primary'}
                  size="sm"
                  className="h-9 flex-1"
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

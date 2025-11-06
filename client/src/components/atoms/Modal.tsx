import { cn } from '@/utils/utils';
import React from 'react';
import Button from './Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/Dialog';

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
  disabled?: boolean;
}

interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  title?: string;
  description?: string;
  message?: string; // Legacy support
  children?: React.ReactNode;
  actions?: ModalAction[];
  footer?: React.ReactNode;
  showCloseButton?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  closable?: boolean;
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
  description,
  message, // Legacy support
  children,
  actions = [],
  footer,
  showCloseButton = true,
  className = '',
  size = 'md',
  closable = true,
}: ModalProps) {
  const sizeClasses = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md', 
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-xl',
    '2xl': 'sm:max-w-2xl',
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && closable && onClose) {
      onClose();
    }
  };

  // Determine content - use children if provided, otherwise use legacy message
  const content = children || (
    <div className="text-center">
      <p className="text-base text-foreground">
        {message}
      </p>
    </div>
  );

  // Determine footer - use custom footer or actions
  const footerContent = footer || (actions.length > 0 && (
    <div className="flex gap-3">
      {actions.map((action, index) => (
        <Button
          key={index}
          variant={action.variant || 'primary'}
          size="md"
          className="flex-1"
          onClick={action.onClick}
          disabled={action.disabled}
        >
          {action.label}
        </Button>
      ))}
    </div>
  ));

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(`${sizeClasses[size]} max-h-[90vh] overflow-hidden flex flex-col`, className)}
        showCloseButton={showCloseButton && closable}
      >
        {(title || description) && (
          <DialogHeader>
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        )}

        <div className="flex-1 overflow-y-auto px-1">
          {content}
        </div>

        {footerContent && (
          <DialogFooter className="pt-4">
            {footerContent}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

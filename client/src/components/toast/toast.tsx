'use client';

import { AlertCircle, Bell, CheckCircle, Info, X, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import toastManager, { Toast } from './toast-manager';

const icons = {
  success: <CheckCircle className="h-5 w-5 text-green-500" />,
  error: <XCircle className="text-primary-base h-5 w-5" />,
  warning: <AlertCircle className="h-5 w-5 text-yellow-500" />,
  info: <Info className="t h-5 w-5" />,
  default: <Bell className="h-5 w-5 text-gray-500" />,
};

const bgColor = {
  success: 'bg-green-300/10',
  error: 'bg-primary-300/10',
  warning: 'bg-yellow-200/10',
  info: 'bg-background',
  default: 'bg-background',
};

function ToastItem({ toast }: { toast: Toast }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 50);
  }, []);

  return (
    <div
      className={`mb-3 transform transition-all duration-300 ease-out ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div
        className={`${bgColor[toast.type || 'default']} z-50 max-w-96 min-w-80 rounded-lg p-4 shadow-md backdrop-blur-sm`}
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex-shrink-0">
            {icons[toast.type || 'default']}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h4 className="text-sm leading-tight font-semibold">
                  {toast.title}
                </h4>
                <p className="mt-1 text-sm leading-relaxed text-wrap">
                  {toast.message}
                </p>
              </div>
              <button
                onClick={() => toastManager.remove(toast.id)}
                className="flex-shrink-0 rounded-full p-1 transition-colors"
              >
                <X className="text-muted-foreground h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    return toastManager.subscribe(setToasts);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4  max-h-screen overflow-hidden">
      <div className="flex max-h-screen flex-col-reverse overflow-y-auto">
        {toasts.length > 1 && (
          <div className="mb-3">
            <button
              onClick={() => toastManager.clearAll()}
              className="hover:bg-muted rounded-full px-3 py-1.5 text-xs text-white shadow-lg transition-colors"
            >
              Clear All ({toasts.length})
            </button>
          </div>
        )}
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { X, Bell, CheckCircle, AlertCircle, XCircle, Info } from "lucide-react";
import toastManager, { Toast } from "./toast-manager";

const icons = {
  success: <CheckCircle className="h-5 w-5 text-green-500" />,
  error: <XCircle className="h-5 w-5 text-primary-base" />,
  warning: <AlertCircle className="h-5 w-5 text-yellow-500" />,
  info: <Info className="h-5 w-5 t" />,
  default: <Bell className="h-5 w-5 text-gray-500" />,
};

function ToastItem({ toast }: { toast: Toast }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 50);
  }, []);

  return (
    <div
      className={`transform transition-all duration-300 ease-out mb-3 ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <div className="bg-background rounded-lg shadow-lg  p-4 min-w-80 max-w-96">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {icons[toast.type || "default"]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h4 className="text-sm font-semibold  leading-tight">
                  {toast.title}
                </h4>
                <p className="text-sm  mt-1 leading-relaxed text-wrap">
                  {toast.message}
                </p>
              </div>
              <button
                onClick={() => toastManager.remove(toast.id)}
                className="flex-shrink-0 p-1 rounded-full  transition-colors"
              >
                <X className="h-4 w-4 text-muted-foreground" />
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
    <div className="fixed top-4 right-4 z-50 max-h-screen overflow-hidden">
      <div className="flex flex-col-reverse max-h-screen overflow-y-auto">
        {toasts.length > 1 && (
          <div className="mb-3">
            <button
              onClick={() => toastManager.clearAll()}
              className="bg- text-white text-xs px-3 py-1.5 rounded-full hover:bg-gray-700 transition-colors shadow-lg"
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

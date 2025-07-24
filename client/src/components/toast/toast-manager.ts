"use client"

export interface Toast {
    id: string
    title: string
    message: string
    type?: "success" | "error" | "warning" | "info" | "default"
}

class ToastManager {
    private toasts: Toast[] = []
    private listeners: ((toasts: Toast[]) => void)[] = []

    subscribe(listener: (toasts: Toast[]) => void) {
        this.listeners.push(listener)
        return () => {
            this.listeners = this.listeners.filter((l) => l !== listener)
        }
    }

    private notify() {
        this.listeners.forEach((listener) => listener([...this.toasts]))
    }

    add(toastData: Omit<Toast, "id" | "timestamp">) {
        const newToast: Toast = {
            ...toastData,
            id: Math.random().toString(36),
        }

        this.toasts = [newToast, ...this.toasts]
        this.notify()

        setTimeout(() => this.remove(newToast.id), 5000)
    }

    remove(id: string) {
        this.toasts = this.toasts.filter((toast) => toast.id !== id)
        this.notify()
    }

    clearAll() {
        this.toasts = []
        this.notify()
    }
}

const manager = new ToastManager()

export const toast = {
    success: (title: string, message: string) =>
        manager.add({ title, message, type: "success" }),
    error: (title: string, message: string) => manager.add({ title, message, type: "error" }),
    warning: (title: string, message: string) =>
        manager.add({ title, message, type: "warning" }),
    info: (title: string, message: string) => manager.add({ title, message, type: "info" }),
    default: (title: string, message: string) =>
        manager.add({ title, message, type: "default" }),
    clearAll: () => manager.clearAll(),
}

export default manager

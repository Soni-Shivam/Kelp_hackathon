'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

// Toast types
type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substring(7);
        setToasts(prev => [...prev, { id, message, type }]);

        // Auto-remove after 4 seconds
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    }, []);

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            {/* Toast Container */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border animate-in slide-in-from-right-5 fade-in duration-300",
                            toast.type === 'success' && "bg-green-50 border-green-200 text-green-800",
                            toast.type === 'error' && "bg-red-50 border-red-200 text-red-800",
                            toast.type === 'info' && "bg-blue-50 border-blue-200 text-blue-800"
                        )}
                    >
                        {toast.type === 'success' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                        {toast.type === 'error' && <XCircle className="h-5 w-5 text-red-500" />}
                        {toast.type === 'info' && <Info className="h-5 w-5 text-blue-500" />}

                        <span className="text-sm font-medium">{toast.message}</span>

                        <button
                            onClick={() => removeToast(toast.id)}
                            className="ml-2 hover:opacity-70 transition-opacity"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

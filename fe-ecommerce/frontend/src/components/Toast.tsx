"use client";

import { useEffect } from "react";
import { useToastStore, type ToastType } from "@/store/toastStore";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

const iconMap: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
};

const bgMap: Record<ToastType, string> = {
    success: "border-emerald-200 dark:border-emerald-800 bg-emerald-50/90 dark:bg-emerald-950/90",
    error: "border-red-200 dark:border-red-800 bg-red-50/90 dark:bg-red-950/90",
    warning: "border-amber-200 dark:border-amber-800 bg-amber-50/90 dark:bg-amber-950/90",
    info: "border-blue-200 dark:border-blue-800 bg-blue-50/90 dark:bg-blue-950/90",
};

const barColorMap: Record<ToastType, string> = {
    success: "bg-emerald-500",
    error: "bg-red-500",
    warning: "bg-amber-500",
    info: "bg-blue-500",
};

function ToastItem({ id, type, title, message, duration = 4000 }: { id: string; type: ToastType; title: string; message?: string; duration?: number }) {
    const removeToast = useToastStore((s) => s.removeToast);

    useEffect(() => {
        const timer = setTimeout(() => removeToast(id), duration);
        return () => clearTimeout(timer);
    }, [id, duration, removeToast]);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 80, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={`relative overflow-hidden rounded-2xl border backdrop-blur-xl shadow-lg ${bgMap[type]} min-w-[320px] max-w-[420px]`}
        >
            <div className="flex items-start gap-3 p-4">
                <div className="mt-0.5 flex-shrink-0">{iconMap[type]}</div>
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-900 dark:text-gray-100">{title}</p>
                    {message && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 leading-relaxed">{message}</p>
                    )}
                </div>
                <button
                    onClick={() => removeToast(id)}
                    className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
            {/* Progress Bar */}
            <div className="h-1 w-full bg-black/5 dark:bg-white/5">
                <div
                    className={`h-full ${barColorMap[type]} rounded-full`}
                    style={{
                        animation: `countdown ${duration}ms linear forwards`,
                    }}
                />
            </div>
        </motion.div>
    );
}

export default function ToastContainer() {
    const toasts = useToastStore((s) => s.toasts);

    return (
        <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <div key={toast.id} className="pointer-events-auto">
                        <ToastItem {...toast} />
                    </div>
                ))}
            </AnimatePresence>
        </div>
    );
}

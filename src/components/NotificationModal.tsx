'use client';

import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, X } from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'success' | 'error' | 'warning';
  title: string;
  message: string;
  confirmText?: string;
}

export default function NotificationModal({
  isOpen,
  onClose,
  type,
  title,
  message,
  confirmText = 'Close',
}: NotificationModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const typeConfig = {
    success: {
      icon: <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-450" />,
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
      btnColor: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/10',
      borderColor: 'border-emerald-100 dark:border-emerald-900/30',
    },
    error: {
      icon: <AlertCircle className="w-8 h-8 text-red-650 dark:text-red-400" />,
      bgColor: 'bg-red-50 dark:bg-red-950/20',
      btnColor: 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/10',
      borderColor: 'border-red-100 dark:border-red-900/30',
    },
    warning: {
      icon: <AlertTriangle className="w-8 h-8 text-amber-600 dark:text-amber-400" />,
      bgColor: 'bg-amber-50 dark:bg-amber-950/20',
      btnColor: 'bg-amber-500 hover:bg-amber-600 text-black shadow-amber-500/10',
      borderColor: 'border-amber-100 dark:border-amber-900/30',
    },
  };

  const config = typeConfig[type] || typeConfig.success;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-200 flex flex-col items-center text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon Circle */}
        <div className={`p-4 rounded-full ${config.bgColor} border ${config.borderColor} mb-4 flex items-center justify-center`}>
          {config.icon}
        </div>

        {/* Content */}
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
          {title}
        </h3>
        <p className="mt-2 text-sm text-zinc-555 dark:text-zinc-400 leading-relaxed font-medium">
          {message}
        </p>

        {/* Action Button */}
        <button
          onClick={onClose}
          className={`mt-6 w-full py-2.5 px-4 font-bold rounded-xl text-xs transition duration-150 cursor-pointer shadow-md ${config.btnColor}`}
        >
          {confirmText}
        </button>
      </div>
    </div>
  );
}

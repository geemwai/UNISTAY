import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

export interface ToastMessage {
  id: number;
  text: string;
  type: "success" | "error";
}

interface ToastProps {
  key?: React.Key;
  toast: ToastMessage;
  onClose: (id: number) => void;
}

export default function Toast({ toast, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 5000); // Auto-clear after 5s

    return () => clearTimeout(timer);
  }, [toast, onClose]);

  return (
    <div
      className={`flex items-center gap-3 px-5 py-4 rounded-2xl border shadow-xl max-w-sm w-full animate-slide-in text-left transition-all ${
        toast.type === "success"
          ? "bg-slate-900 border-emerald-950/50 text-slate-100"
          : "bg-slate-900 border-rose-950/50 text-slate-100"
      }`}
    >
      <div className="shrink-0">
        {toast.type === "success" ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        ) : (
          <AlertCircle className="w-5 h-5 text-rose-400" />
        )}
      </div>
      <p className="text-sm font-bold flex-1 leading-snug">{toast.text}</p>
      <button
        onClick={() => onClose(toast.id)}
        className="p-1 text-slate-500 hover:text-slate-300 rounded-lg cursor-pointer transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

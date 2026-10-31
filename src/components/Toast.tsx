import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl shadow-[0_12px_32px_rgba(41,42,58,0.1)] border transition-all duration-200 animate-in fade-in slide-in-from-bottom-3 ${
            toast.type === 'success'
              ? 'bg-[#E1F3EB] border-[#CEEBDD] text-[#2E7D5D]'
              : toast.type === 'error'
              ? 'bg-[#FFEBEB] border-[#FFD5D5] text-[#D34545]'
              : 'bg-white border-[#E3DCF7] text-[#252735]'
          }`}
        >
          <div className="shrink-0 mt-0.5">
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#55C9A2]" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-[#E99B9B]" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-[#6254E8]" />}
          </div>
          <div className="flex-1 text-xs font-semibold leading-relaxed">{toast.text}</div>
          <button
            onClick={() => removeToast(toast.id)}
            className="shrink-0 text-[#9299A8] hover:text-[#252735] transition-colors p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};

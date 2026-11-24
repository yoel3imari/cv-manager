import React from 'react';
import { useCvStore } from '../../store/useCvStore';

export const Toast: React.FC = () => {
  const { toastMessage, toastType } = useCvStore();
  if (!toastMessage) return null;

  return (
    <div className="no-print fixed bottom-4 right-4 z-50">
      <div
        className={`px-3.5 py-2 rounded-xl shadow-lg text-xs font-medium flex items-center gap-2 border transition ${
          toastType === 'error'
            ? 'bg-red-950 text-red-100 border-red-800'
            : 'bg-zinc-900 text-white border-zinc-800'
        }`}
      >
        <span
          className={`w-2 h-2 rounded-full ${
            toastType === 'error' ? 'bg-red-400' : 'bg-emerald-400'
          }`}
        />
        <span>{toastMessage}</span>
      </div>
    </div>
  );
};

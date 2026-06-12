import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface border border-border-strong rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-scale-in">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-rose-950/30 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={18} className="text-rose-400" />
          </div>
          <div className="flex-grow">
            <h3 className="font-bold text-on-surface mb-1">Confirm Action</h3>
            <p className="text-sm text-secondary">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 mt-5 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-border-strong hover:bg-white/5 text-secondary text-sm rounded-xl transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl transition-all cursor-pointer"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'An unexpected error occurred during interest inference analysis.',
  onRetry,
}) => {
  return (
    <div className="rounded-3xl border border-rose-200 bg-rose-50/50 p-8 text-center shadow-xs">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
        <AlertCircle className="h-6 w-6" />
      </div>

      <h3 className="mt-3 text-base font-bold text-slate-900">Analysis Incomplete</h3>
      <p className="mt-1 text-xs text-slate-600 max-w-md mx-auto">{message}</p>

      <button
        onClick={onRetry}
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-rose-700 transition-colors cursor-pointer"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        <span>Retry Analysis</span>
      </button>
    </div>
  );
};

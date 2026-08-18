import React, { useState, useEffect } from 'react';
import { Sparkles, Cpu, Filter, CheckCircle2, RefreshCw } from 'lucide-react';

export const LoadingState: React.FC = () => {
  const [stepIndex, setStepIndex] = useState(0);

  const steps = [
    'Parsing student watch telemetry & engagement percentages...',
    'Separating surface keywords from implicit cognitive signals...',
    'Weighting positive completions vs early skips...',
    'Executing anti-hype filter against candidate catalog...',
    'Calibrating difficulty and synthesizing recommendation reasoning...',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-3xl border border-indigo-100 bg-white p-8 shadow-xs text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-inner">
        <Sparkles className="h-7 w-7 animate-spin text-indigo-600" />
      </div>

      <h3 className="mt-4 text-lg font-bold text-slate-900">
        AI Interest Inference Agent Running...
      </h3>
      <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
        Evaluating the 13-step inference architecture via Gemini to avoid superficial keyword traps.
      </p>

      {/* Progress Steps List */}
      <div className="mt-6 max-w-md mx-auto space-y-2 text-left">
        {steps.map((step, idx) => {
          const isDone = idx < stepIndex;
          const isCurrent = idx === stepIndex;

          return (
            <div
              key={idx}
              className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2 text-xs transition-all ${
                isCurrent
                  ? 'bg-indigo-50 border border-indigo-200 text-indigo-900 font-semibold'
                  : isDone
                  ? 'text-slate-700 bg-slate-50'
                  : 'text-slate-400 opacity-40'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              ) : isCurrent ? (
                <RefreshCw className="h-4 w-4 animate-spin text-indigo-600 shrink-0" />
              ) : (
                <div className="h-4 w-4 rounded-full border border-slate-300 shrink-0" />
              )}
              <span>{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

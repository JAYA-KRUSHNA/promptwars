import React, { useState, useEffect } from 'react';
import { Sparkles, Cpu, Filter, CheckCircle2, RefreshCw, Layers } from 'lucide-react';

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
    <div className="relative overflow-hidden rounded-3xl border border-indigo-200/80 bg-gradient-to-b from-white via-indigo-50/20 to-purple-50/20 p-8 sm:p-12 shadow-sm text-center">
      <div className="absolute top-0 right-0 -mt-10 -mr-10 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-300">
        <Sparkles className="h-8 w-8 text-yellow-300 animate-spin" />
      </div>

      <h3 className="mt-5 text-xl font-extrabold tracking-tight text-slate-900">
        AI Interest Inference Agent Running...
      </h3>
      <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
        Evaluating the 13-step inference architecture to penetrate past surface clickbait and identify true engineering interests.
      </p>

      {/* Progress Steps List */}
      <div className="mt-6 max-w-md mx-auto space-y-2.5 text-left">
        {steps.map((step, idx) => {
          const isDone = idx < stepIndex;
          const isCurrent = idx === stepIndex;

          return (
            <div
              key={idx}
              className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-xs transition-all ${
                isCurrent
                  ? 'bg-white border border-indigo-300 text-indigo-950 font-bold shadow-xs ring-1 ring-indigo-500/20'
                  : isDone
                  ? 'text-slate-700 bg-white/70 border border-slate-200/70 font-medium'
                  : 'text-slate-400 opacity-40 bg-slate-50 border border-transparent'
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

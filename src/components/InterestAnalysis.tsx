import React from 'react';
import { AnalysisResult, AnalysisSource, Reel } from '../lib/types';
import { Compass, CheckCircle2, ShieldAlert, Sparkles, Zap, HelpCircle } from 'lucide-react';
import { OfficialOutputCard } from './OfficialOutputCard';

interface InterestAnalysisProps {
  analysis: AnalysisResult;
  onOpenReveal: () => void;
  source?: AnalysisSource | null;
  latencyMs?: number | null;
  activeReels?: Reel[];
}

export const InterestAnalysis: React.FC<InterestAnalysisProps> = ({
  analysis,
  onOpenReveal,
  source,
  latencyMs,
  activeReels = [],
}) => {
  const confidenceColor: Record<string, string> = {
    High: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Medium: 'bg-amber-50 text-amber-700 border-amber-200',
    Low: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return (
    <div className="space-y-6">
      {/* Primary Inferred Interest Hero */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-100 text-indigo-600">
                <Compass className="h-4 w-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                Inferred Latent Intent
              </span>
            </div>
            <h2 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              {analysis.interest_detected}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${confidenceColor[analysis.confidence] || 'bg-slate-100 text-slate-700'
                  }`}
              >
                Confidence: {analysis.confidence}
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                Domain: {analysis.category}
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                Level: {analysis.difficulty}
              </span>
              {source && (
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider border ${source === 'gemini'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                >
                  {source === 'gemini' ? '⚡ Gemini Live' : '🔧 Fallback'}
                  {latencyMs != null && ` · ${(latencyMs / 1000).toFixed(1)}s`}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={onOpenReveal}
            className="flex items-center gap-2 rounded-xl bg-indigo-50 border border-indigo-200/80 px-4 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors shadow-2xs cursor-pointer self-start"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Inspect Live Reasoning Graph</span>
          </button>
        </div>

        {/* Inference Reasoning & Psychological Synthesis */}
        <div className="mt-5 space-y-3">
          <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Holistic Session Synthesis (WHY):
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {analysis.why}
            </p>
          </div>

          {/* Contrast Card: Surface Trap vs True Inferred Intent */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
            <div className="flex items-start gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                  Keyword Trap Defense (Surface vs Latent):
                </h4>
                <p className="mt-1 text-xs text-amber-950/80 leading-relaxed">
                  {analysis.surface_vs_underlying}
                </p>
              </div>
            </div>
          </div>

          {/* Confidence Reasoning */}
          <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600 flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-indigo-600 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-800">Confidence Calibration Factor: </span>
              {analysis.confidence_reasoning}
            </div>
          </div>
        </div>
      </div>

      {/* Signals Breakdown Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-1">
          Implied Signal Breakdown by Reel (CURRENT REEL Analysis)
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          How each watch event was weighted and transformed from literal keywords into cognitive intent.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                <th className="py-2.5 px-3 font-semibold">CURRENT REEL</th>
                <th className="py-2.5 px-3 font-semibold">Surface Keyword</th>
                <th className="py-2.5 px-3 font-semibold">Inferred Signal</th>
                <th className="py-2.5 px-3 font-semibold">Signal Weight</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {analysis.reel_signals.map((sig, i) => (
                <tr key={i} className="hover:bg-slate-50/80">
                  <td className="py-2.5 px-3 font-medium text-slate-900 max-w-[200px] truncate">
                    <span className="text-slate-400 font-mono mr-1">#{i + 1}</span> {sig.reel_title}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 line-through">
                    {sig.surface_topic}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-indigo-700">
                    {sig.implied_signal}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${sig.signal_strength === 'positive'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : sig.signal_strength === 'negative'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                    >
                      {sig.signal_strength}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Standard Schema Output Card */}
      <OfficialOutputCard analysis={analysis} activeReels={activeReels} />
    </div>
  );
};

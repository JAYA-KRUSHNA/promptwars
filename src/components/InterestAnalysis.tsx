import React from 'react';
import { AnalysisResult, AnalysisSource, Reel } from '../lib/types';
import { Compass, CheckCircle2, ShieldAlert, Sparkles, Network } from 'lucide-react';
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
  const confidenceBadge: Record<string, string> = {
    High: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    Medium: 'bg-amber-50 text-amber-800 border-amber-200',
    Low: 'bg-rose-50 text-rose-800 border-rose-200',
  };

  return (
    <div className="space-y-6">
      {/* Primary Inferred Interest Hero */}
      <div
        role="region"
        aria-label="Inferred Latent Intent Details"
        className="glass-card rounded-2xl p-6 sm:p-8 transition-all"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <Compass className="h-3.5 w-3.5" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">
                Inferred Latent Intent
              </span>
            </div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
              {analysis.interest_detected}
            </h2>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-md border px-2.5 py-0.5 text-xs font-bold ${
                  confidenceBadge[analysis.confidence] || 'bg-slate-100 text-slate-700'
                }`}
              >
                Confidence: {analysis.confidence}
              </span>
              <span className="rounded-md bg-slate-100 border border-slate-200/80 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                Domain: {analysis.category}
              </span>
              <span className="rounded-md bg-slate-100 border border-slate-200/80 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                Level: {analysis.difficulty}
              </span>
              {source && (
                <span
                  className={`rounded-md px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider border ${
                    source === 'gemini'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  {source === 'gemini' ? '⚡ Gemini 3.6 Flash' : '🔧 Fallback Engine'}
                  {latencyMs != null && ` · ${(latencyMs / 1000).toFixed(1)}s`}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={onOpenReveal}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 px-4 py-2 text-xs font-bold text-indigo-700 transition-colors cursor-pointer self-start"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
            <span>Reasoning Pipeline</span>
          </button>
        </div>

        {/* Inference Reasoning & Psychological Synthesis */}
        <div className="mt-6 space-y-3">
          <div className="rounded-xl bg-slate-50/90 border border-slate-200/80 p-4">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
              Holistic Session Synthesis (WHY):
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
              {analysis.why}
            </p>
          </div>

          {/* Contrast Card: Surface Trap vs True Inferred Intent */}
          <div className="rounded-xl border border-amber-200/80 bg-amber-50/60 p-4 text-xs">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <h4 className="text-[11px] font-bold text-amber-900 uppercase tracking-wide">
                  Keyword Trap Defense (Surface vs Latent Intent):
                </h4>
                <p className="mt-1 text-xs text-amber-950 leading-relaxed font-normal">
                  {analysis.surface_vs_underlying}
                </p>
              </div>
            </div>
          </div>

          {/* Confidence Reasoning */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 text-xs text-slate-600 flex items-start gap-2.5">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800">Confidence Calibration Factor: </span>
              {analysis.confidence_reasoning}
            </div>
          </div>
        </div>
      </div>

      {/* Signals Breakdown Table */}
      <div className="glass-card rounded-2xl p-5 sm:p-6">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-base font-bold text-slate-900">
            Implied Signal Breakdown by Reel (CURRENT REEL Analysis)
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            {analysis.reel_signals.length} Signals
          </span>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          How each watch event was weighted and transformed from literal keywords into cognitive engineering intent.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/70">
                <th className="py-2.5 px-3 font-bold uppercase text-[10px]">CURRENT REEL</th>
                <th className="py-2.5 px-3 font-bold uppercase text-[10px]">Surface Keyword</th>
                <th className="py-2.5 px-3 font-bold uppercase text-[10px]">Inferred Signal</th>
                <th className="py-2.5 px-3 font-bold uppercase text-[10px]">Signal Weight</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {analysis.reel_signals.map((sig, i) => (
                <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-slate-900 max-w-[220px] truncate">
                    <span className="text-slate-400 font-mono mr-1 text-[11px]">#{i + 1}</span> {sig.reel_title}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 line-through">
                    {sig.surface_topic}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-indigo-700">
                    {sig.implied_signal}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-flex rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                        sig.signal_strength === 'positive'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : sig.signal_strength === 'negative'
                          ? 'bg-rose-50 text-rose-800 border border-rose-200'
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

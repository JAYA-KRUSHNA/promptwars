import React from 'react';
import { AnalysisResult, AnalysisSource, Reel } from '../lib/types';
import { Compass, CheckCircle2, ShieldAlert, Sparkles, Zap, HelpCircle, Network, ArrowRight } from 'lucide-react';
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
  const confidenceColor: Record<string, { badge: string; text: string }> = {
    High: {
      badge: 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-glow-emerald/10',
      text: 'text-emerald-700',
    },
    Medium: {
      badge: 'bg-amber-50 text-amber-800 border-amber-300 shadow-glow-amber/10',
      text: 'text-amber-700',
    },
    Low: {
      badge: 'bg-rose-50 text-rose-800 border-rose-300',
      text: 'text-rose-700',
    },
  };

  return (
    <div className="space-y-6">
      {/* Primary Inferred Interest Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-200/80 bg-gradient-to-br from-white via-indigo-50/20 to-purple-50/20 p-6 sm:p-8 shadow-sm">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
                <Compass className="h-4 w-4" />
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-indigo-700">
                Inferred Latent Intent
              </span>
            </div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
              {analysis.interest_detected}
            </h2>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full border px-3 py-0.5 text-xs font-bold ${
                  confidenceColor[analysis.confidence]?.badge || 'bg-slate-100 text-slate-700'
                }`}
              >
                Confidence: {analysis.confidence}
              </span>
              <span className="rounded-full bg-slate-100/90 border border-slate-200 px-3 py-0.5 text-xs font-bold text-slate-700">
                Domain: {analysis.category}
              </span>
              <span className="rounded-full bg-slate-100/90 border border-slate-200 px-3 py-0.5 text-xs font-bold text-slate-700">
                Level: {analysis.difficulty}
              </span>
              {source && (
                <span
                  className={`rounded-full px-3 py-0.5 text-xs font-extrabold uppercase tracking-wider border shadow-2xs ${
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
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transition-all cursor-pointer self-start"
          >
            <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
            <span>Reasoning Pipeline</span>
          </button>
        </div>

        {/* Inference Reasoning & Psychological Synthesis */}
        <div className="mt-6 space-y-3.5">
          <div className="rounded-2xl bg-white/90 border border-slate-200/90 p-4 sm:p-5 shadow-2xs">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-indigo-600" /> Holistic Session Synthesis (WHY):
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {analysis.why}
            </p>
          </div>

          {/* Contrast Card: Surface Trap vs True Inferred Intent */}
          <div className="rounded-2xl border border-amber-200/90 bg-amber-50/70 p-4 sm:p-5 shadow-2xs">
            <div className="flex items-start gap-3">
              <ShieldAlert className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <h4 className="text-xs font-black text-amber-900 uppercase tracking-wide">
                  Keyword Trap Defense (Surface vs Latent Intent):
                </h4>
                <p className="mt-1.5 text-xs text-amber-950 leading-relaxed font-medium">
                  {analysis.surface_vs_underlying}
                </p>
              </div>
            </div>
          </div>

          {/* Confidence Reasoning */}
          <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 text-xs text-slate-700 flex items-start gap-3 shadow-2xs">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900">Confidence Calibration Factor: </span>
              {analysis.confidence_reasoning}
            </div>
          </div>
        </div>
      </div>

      {/* Signals Breakdown Table */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-base font-bold text-slate-900">
            Implied Signal Breakdown by Reel (CURRENT REEL Analysis)
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            {analysis.reel_signals.length} Signals Decoded
          </span>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          How each watch event was weighted and transformed from literal keywords into cognitive engineering intent.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 bg-slate-50/80">
                <th className="py-3 px-3.5 font-bold uppercase text-[10px] tracking-wider">CURRENT REEL</th>
                <th className="py-3 px-3.5 font-bold uppercase text-[10px] tracking-wider">Surface Keyword</th>
                <th className="py-3 px-3.5 font-bold uppercase text-[10px] tracking-wider">Inferred Signal</th>
                <th className="py-3 px-3.5 font-bold uppercase text-[10px] tracking-wider">Signal Weight</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {analysis.reel_signals.map((sig, i) => (
                <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3.5 font-semibold text-slate-900 max-w-[220px] truncate">
                    <span className="text-slate-400 font-mono mr-1.5 text-[11px]">#{i + 1}</span> {sig.reel_title}
                  </td>
                  <td className="py-3 px-3.5 text-slate-400 line-through">
                    {sig.surface_topic}
                  </td>
                  <td className="py-3 px-3.5 font-bold text-indigo-700">
                    {sig.implied_signal}
                  </td>
                  <td className="py-3 px-3.5">
                    <span
                      className={`inline-flex rounded-md px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                        sig.signal_strength === 'positive'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs'
                          : sig.signal_strength === 'negative'
                          ? 'bg-rose-50 text-rose-800 border border-rose-200 shadow-2xs'
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

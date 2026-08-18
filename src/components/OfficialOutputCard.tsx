import React, { useState } from 'react';
import { AnalysisResult, Reel } from '../lib/types';
import { Copy, Check, Terminal, FileText, CheckCircle2 } from 'lucide-react';

interface OfficialOutputCardProps {
  analysis: AnalysisResult;
  activeReels?: Reel[];
}

export const OfficialOutputCard: React.FC<OfficialOutputCardProps> = ({
  analysis,
  activeReels = [],
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  // Build the current reel reference text
  const currentReelReference =
    activeReels.length > 0
      ? activeReels
          .map((r, i) => `#${i + 1} "${r.title}" (${r.category}, ${r.engagement.watch_percent}% watch${r.engagement.liked ? ', liked' : ''}${r.engagement.skipped_early ? ', skipped' : ''})`)
          .join('; ')
      : analysis.reel_signals.length > 0
      ? analysis.reel_signals.map((s) => `"${s.reel_title}" [${s.surface_topic}]`).join('; ')
      : 'Active Watch Session';

  const formattedOutputText = `CURRENT REEL: ${currentReelReference}
INTEREST DETECTED: ${analysis.interest_detected}
WHY: ${analysis.why}
RECOMMENDED TECH REEL: ${analysis.recommended_tech_reel}
CATEGORY: ${analysis.category}
WHY THIS RECOMMENDATION: ${analysis.why_this_recommendation}
DIFFICULTY: ${analysis.difficulty}
CONFIDENCE: ${analysis.confidence}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedOutputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-indigo-200 bg-slate-900 text-slate-100 p-5 shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3.5 mb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-500/20 text-indigo-400">
            <Terminal className="h-3.5 w-3.5" />
          </span>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300">
              Required Schema Output Spec
            </h4>
            <p className="text-[11px] text-slate-400">
              100% compliant with standard prompt output schema
            </p>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors cursor-pointer self-start sm:self-auto"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-300" />
              <span>Copied Spec!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy Schema Text</span>
            </>
          )}
        </button>
      </div>

      {/* Structured Output Grid */}
      <div className="space-y-2.5 font-mono text-xs leading-relaxed">
        <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800/80">
          <span className="text-indigo-400 font-bold">CURRENT REEL: </span>
          <span className="text-slate-300">{currentReelReference}</span>
        </div>

        <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800/80">
          <span className="text-emerald-400 font-bold">INTEREST DETECTED: </span>
          <span className="text-white font-semibold">{analysis.interest_detected}</span>
        </div>

        <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800/80">
          <span className="text-amber-400 font-bold">WHY: </span>
          <span className="text-slate-300">{analysis.why}</span>
        </div>

        <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800/80">
          <span className="text-indigo-300 font-bold">RECOMMENDED TECH REEL: </span>
          <span className="text-white font-bold">{analysis.recommended_tech_reel}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800/80">
            <span className="text-cyan-400 font-bold">CATEGORY: </span>
            <span className="rounded bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 text-cyan-200 font-bold">
              {analysis.category}
            </span>
          </div>

          <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800/80">
            <span className="text-purple-400 font-bold">DIFFICULTY: </span>
            <span className="text-purple-200 font-semibold">{analysis.difficulty}</span>
          </div>

          <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800/80">
            <span className="text-emerald-400 font-bold">CONFIDENCE: </span>
            <span
              className={`rounded px-2 py-0.5 font-bold ${
                analysis.confidence === 'High'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : analysis.confidence === 'Medium'
                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                  : 'bg-rose-950 text-rose-300 border border-rose-800'
              }`}
            >
              {analysis.confidence}
            </span>
          </div>
        </div>

        <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800/80">
          <span className="text-emerald-400 font-bold">WHY THIS RECOMMENDATION: </span>
          <span className="text-slate-300">{analysis.why_this_recommendation}</span>
        </div>
      </div>
    </div>
  );
};

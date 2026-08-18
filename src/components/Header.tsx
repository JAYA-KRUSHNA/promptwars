import React from 'react';
import { Sparkles, Compass, ShieldCheck, Database, Zap, Film, Cpu } from 'lucide-react';
import { AnalysisSource } from '../lib/types';

interface HeaderProps {
  onOpenCatalog: () => void;
  onRegenerate: () => void;
  isAnalyzing: boolean;
  activeView: 'reels' | 'analysis' | 'recommendation';
  setActiveView: (view: 'reels' | 'analysis' | 'recommendation') => void;
  hasAnalysis: boolean;
  analysisSource?: AnalysisSource | null;
  analysisLatency?: number | null;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCatalog,
  onRegenerate,
  isAnalyzing,
  activeView,
  setActiveView,
  hasAnalysis,
  analysisSource,
  analysisLatency,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md transition-all shadow-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative group cursor-pointer">
            <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-60 blur-xs transition group-hover:opacity-100" />
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white shadow-md">
              <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse-subtle" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900">
                Reels Recommendation System
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700 border border-indigo-200/80 shadow-2xs">
                <Cpu className="h-3 w-3 text-indigo-600" /> AI Agent
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden md:block">
              Analyzes student watch sessions to infer underlying interests and recommend educational tech Reels
            </p>
          </div>
        </div>

        {/* View Navigation Pill (Centered on Large Screens) */}
        {hasAnalysis && (
          <div className="hidden lg:flex items-center rounded-xl border border-slate-200/90 bg-slate-100/80 p-1 shadow-inner">
            <button
              onClick={() => setActiveView('reels')}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                activeView === 'reels'
                  ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200/70 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Film className="h-3.5 w-3.5" />
              <span>1. Watched Feed</span>
            </button>
            <button
              onClick={() => setActiveView('analysis')}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                activeView === 'analysis'
                  ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200/70 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Compass className="h-3.5 w-3.5" />
              <span>2. Inferred Intent</span>
            </button>
            <button
              onClick={() => setActiveView('recommendation')}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                activeView === 'recommendation'
                  ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200/70 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
              <span>3. Tech Recommendation</span>
            </button>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Gemini Live Status Indicator */}
          {analysisSource && (
            <div
              className={`hidden sm:flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider border shadow-2xs ${
                analysisSource === 'gemini'
                  ? 'bg-emerald-50/90 text-emerald-800 border-emerald-200 shadow-glow-emerald/20'
                  : 'bg-amber-50/90 text-amber-800 border-amber-200 shadow-glow-amber/20'
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  analysisSource === 'gemini' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <span>
                {analysisSource === 'gemini' ? '⚡ Gemini 3.6 Flash' : '🔧 Fallback Engine'}
                {analysisLatency != null && ` · ${(analysisLatency / 1000).toFixed(1)}s`}
              </span>
            </div>
          )}

          <button
            onClick={onOpenCatalog}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:border-slate-300 hover:text-indigo-600 transition-all cursor-pointer"
            title="Inspect candidate tech reels and test hype distractors"
          >
            <Database className="h-3.5 w-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Catalog</span>
            <span className="rounded-md bg-indigo-50 px-1.5 py-0.2 text-[10px] font-bold text-indigo-700">
              18
            </span>
          </button>

          <button
            onClick={onRegenerate}
            disabled={isAnalyzing}
            className="group relative flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 px-4 py-2 text-xs font-bold text-white shadow-sm shadow-indigo-200 hover:shadow-indigo-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer"
          >
            <Zap className={`h-3.5 w-3.5 text-yellow-300 ${isAnalyzing ? 'animate-spin' : 'group-hover:rotate-12 transition-transform'}`} />
            <span>{isAnalyzing ? 'Analyzing...' : 'Re-Infer'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

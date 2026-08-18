import React from 'react';
import { Sparkles, Compass, ShieldCheck, Database, Zap } from 'lucide-react';
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
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-200">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-slate-900">PromptWars</span>
              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 border border-indigo-200/60">
                Interest Inference Agent
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Penetrates surface clickbait & keyword traps to infer true engineering intent
            </p>
          </div>
        </div>

        {/* View Navigation Pill */}
        {hasAnalysis && (
          <div className="hidden md:flex items-center rounded-lg border border-slate-200 bg-slate-50 p-1">
            <button
              onClick={() => setActiveView('reels')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                activeView === 'reels'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1. Watch Session
            </button>
            <button
              onClick={() => setActiveView('analysis')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                activeView === 'analysis'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              2. Inferred Interest
            </button>
            <button
              onClick={() => setActiveView('recommendation')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                activeView === 'recommendation'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              3. Tech Reel Rec
            </button>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Gemini Live Status Indicator */}
          {analysisSource && (
            <div
              className={`hidden sm:flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider border ${
                analysisSource === 'gemini'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  analysisSource === 'gemini' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <span>
                {analysisSource === 'gemini' ? 'Gemini Live' : 'Fallback'}
                {analysisLatency != null && ` · ${(analysisLatency / 1000).toFixed(1)}s`}
              </span>
            </div>
          )}

          <button
            onClick={onOpenCatalog}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50 hover:border-slate-300 transition-colors"
            title="Inspect candidate tech reels and test hype distractors"
          >
            <Database className="h-3.5 w-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Inspect</span> Catalog (18)
          </button>

          <button
            onClick={onRegenerate}
            disabled={isAnalyzing}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer"
          >
            <Zap className={`h-3.5 w-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'Analyzing...' : 'Live Regenerate'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

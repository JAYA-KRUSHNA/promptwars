import React, { useState, useEffect } from 'react';
import { SESSIONS, ALL_REELS, generateRandomSession } from './data/sessions';
import { CATALOG } from './data/catalog';
import { AnalysisResult, AnalysisSource, Reel, Session } from './lib/types';
import { generateDeterministicAnalysis } from './lib/gemini';
import { Header } from './components/Header';
import { SessionSelector } from './components/SessionSelector';
import { ReelGrid } from './components/ReelGrid';
import { InterestAnalysis } from './components/InterestAnalysis';
import { RecommendationCard } from './components/RecommendationCard';
import { ReasoningReveal } from './components/ReasoningReveal';
import { CatalogModal } from './components/CatalogModal';
import { LoadingState } from './components/LoadingState';
import { ErrorState } from './components/ErrorState';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  RotateCcw,
  CheckCircle2,
  Database,
  Eye,
  SlidersHorizontal,
  Dices,
} from 'lucide-react';

export default function App() {
  const [sessionsList, setSessionsList] = useState<Session[]>(SESSIONS);
  const [activeSessionId, setActiveSessionId] = useState<string>('session_1');
  const [selectedReelIds, setSelectedReelIds] = useState<string[]>(() =>
    SESSIONS[0].reels.map((r) => r.id)
  );
  const [activeView, setActiveView] = useState<'reels' | 'analysis' | 'recommendation'>('reels');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analysisSource, setAnalysisSource] = useState<AnalysisSource | null>(null);
  const [analysisLatency, setAnalysisLatency] = useState<number | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCatalogOpen, setIsCatalogOpen] = useState<boolean>(false);
  const [showReasoningModal, setShowReasoningModal] = useState<boolean>(false);

  const currentSession: Session =
    sessionsList.find((s) => s.id === activeSessionId) || sessionsList[0] || SESSIONS[0];

  // Escape key handler for reasoning modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowReasoningModal(false);
      }
    };
    if (showReasoningModal) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showReasoningModal]);

  // Initialize selected reels whenever the session changes
  useEffect(() => {
    if (currentSession) {
      setSelectedReelIds(currentSession.reels.map((r) => r.id));
      setAnalysisResult(null);
      setAnalysisSource(null);
      setAnalysisLatency(null);
      setErrorMessage(null);
    }
  }, [activeSessionId]);

  // Toggle selection for a single reel
  const handleToggleSelectReel = (reelId: string) => {
    setSelectedReelIds((prev) =>
      prev.includes(reelId) ? prev.filter((id) => id !== reelId) : [...prev, reelId]
    );
  };

  const handleSelectAll = () => {
    setSelectedReelIds(currentSession.reels.map((r) => r.id));
  };

  const handleDeselectAll = () => {
    setSelectedReelIds([]);
  };

  // Generate a live randomized student feed
  const handleRandomizeFeed = () => {
    const newRandomSession = generateRandomSession(7);
    setSessionsList((prev) => [
      newRandomSession,
      ...prev.filter((s) => !s.id.startsWith('custom_random_')),
    ]);
    setActiveSessionId(newRandomSession.id);
    setSelectedReelIds(newRandomSession.reels.map((r) => r.id));
    setAnalysisResult(null);
    setAnalysisSource(null);
    setAnalysisLatency(null);
    setErrorMessage(null);
    setActiveView('reels');
  };

  // Interactive telemetry update on any reel card
  const handleUpdateEngagement = (reelId: string, updated: Partial<Reel['engagement']>) => {
    setSessionsList((prev) =>
      prev.map((s) => {
        if (s.id !== activeSessionId) return s;
        return {
          ...s,
          reels: s.reels.map((r) => {
            if (r.id !== reelId) return r;
            return {
              ...r,
              engagement: {
                ...r.engagement,
                ...updated,
              },
            };
          }),
        };
      })
    );
    // Invalidate previous analysis so user can re-infer with updated telemetry
    setAnalysisResult(null);
  };

  // Perform API analysis using your server Gemini API key
  const runAnalysis = async (targetView: 'analysis' | 'recommendation' = 'analysis') => {
    if (selectedReelIds.length === 0) return;

    setIsAnalyzing(true);
    setErrorMessage(null);

    const reelsToAnalyze = currentSession.reels.filter((r) => selectedReelIds.includes(r.id));
    const activeReels = reelsToAnalyze.length > 0 ? reelsToAnalyze : currentSession.reels;

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: activeSessionId,
          selectedReelIds: selectedReelIds,
          customReels: currentSession.reels,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data.success && data.analysis) {
        setAnalysisResult(data.analysis);
        setAnalysisSource(data.source || 'fallback');
        setAnalysisLatency(data.latencyMs || null);
        setActiveView(targetView);
      } else {
        throw new Error(data.error || 'Failed to analyze watch session.');
      }
    } catch (err: unknown) {
      console.warn('API call fallback to client-side engine:', err);
      // Fallback seamlessly to local deterministic engine
      const localResult = generateDeterministicAnalysis(activeReels, CATALOG);
      setAnalysisResult(localResult);
      setAnalysisSource('fallback');
      setAnalysisLatency(80);
      setActiveView(targetView);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 flex flex-col antialiased">
      {/* Accessible Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-xl focus:bg-indigo-600 focus:px-4 focus:py-2 focus:text-xs focus:font-bold focus:text-white focus:shadow-lg focus:outline-hidden"
      >
        Skip to main content
      </a>

      {/* Header */}
      <Header
        onOpenCatalog={() => setIsCatalogOpen(true)}
        onRegenerate={() => runAnalysis(activeView === 'recommendation' ? 'recommendation' : 'analysis')}
        isAnalyzing={isAnalyzing}
        activeView={activeView}
        setActiveView={setActiveView}
        hasAnalysis={Boolean(analysisResult)}
        analysisSource={analysisSource}
        analysisLatency={analysisLatency}
      />

      {/* Main Container */}
      <main id="main-content" tabIndex={-1} aria-label="Reels Recommendation Dashboard" className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 space-y-6">
        {/* Session Selector Strip */}
        <SessionSelector
          sessions={sessionsList}
          activeSessionId={activeSessionId}
          onSelectSession={(id) => {
            setActiveSessionId(id);
            setActiveView('reels');
          }}
          onRandomizeFeed={handleRandomizeFeed}
          disabled={isAnalyzing}
        />

        {/* View Switcher Bar (Mobile & Desktop) */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView('reels')}
              className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeView === 'reels'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              1. Watched Feed ({currentSession.reels.length})
            </button>

            <button
              onClick={() => {
                if (!analysisResult) runAnalysis('analysis');
                else setActiveView('analysis');
              }}
              className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeView === 'analysis'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              2. Inferred Intent
            </button>

            <button
              onClick={() => {
                if (!analysisResult) runAnalysis('recommendation');
                else setActiveView('recommendation');
              }}
              className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeView === 'recommendation'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              3. Curated Pick
            </button>
          </div>

          {analysisResult && (
            <button
              onClick={() => setShowReasoningModal(true)}
              className="hidden sm:flex items-center gap-1.5 rounded-xl bg-indigo-50 border border-indigo-200 px-3.5 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
              <span>Reasoning Graph</span>
            </button>
          )}
        </div>

        {/* View Content Rendering */}
        {isAnalyzing ? (
          <LoadingState />
        ) : errorMessage ? (
          <ErrorState message={errorMessage} onRetry={runAnalysis} />
        ) : (
          <div>
            {/* VIEW 1: REELS GRID */}
            {activeView === 'reels' && (
              <div className="space-y-6">
                <ReelGrid
                  reels={currentSession.reels}
                  selectedIds={selectedReelIds}
                  onToggleSelect={handleToggleSelectReel}
                  onSelectAll={handleSelectAll}
                  onDeselectAll={handleDeselectAll}
                  onAnalyze={runAnalysis}
                  onUpdateEngagement={handleUpdateEngagement}
                  isAnalyzing={isAnalyzing}
                />

                {/* Instant Analysis Preview Footer */}
                {analysisResult && (
                  <div className="mt-8 rounded-2xl border border-indigo-100 bg-white p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-bold">
                        ✓
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
                            Latest Agent Inference Ready
                          </span>
                          {analysisSource && (
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                analysisSource === 'gemini'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : 'bg-amber-100 text-amber-800 border border-amber-200'
                              }`}
                            >
                              {analysisSource === 'gemini' ? '⚡ Gemini Live' : '🔧 Fallback Engine'}
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-slate-900">
                          {analysisResult.interest_detected} → {analysisResult.recommended_tech_reel}
                        </h4>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveView('analysis')}
                      className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors cursor-pointer"
                    >
                      <span>Explore Inferred Results</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* VIEW 2: INTEREST ANALYSIS */}
            {activeView === 'analysis' && analysisResult && (
              <div className="space-y-6">
                <InterestAnalysis
                  analysis={analysisResult}
                  onOpenReveal={() => setShowReasoningModal(true)}
                  source={analysisSource}
                  latencyMs={analysisLatency}
                  activeReels={currentSession.reels}
                />

                {/* Next Step Banner */}
                <div className="flex items-center justify-between rounded-2xl bg-indigo-900 text-white p-5 shadow-sm">
                  <div>
                    <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
                      Proceed to Final Step
                    </span>
                    <h4 className="text-base font-bold text-white mt-0.5">
                      Explore the Selected Tech Recommendation
                    </h4>
                  </div>
                  <button
                    onClick={() => setActiveView('recommendation')}
                    className="flex items-center gap-1.5 rounded-xl bg-white text-indigo-950 font-bold px-4 py-2 text-xs hover:bg-indigo-50 transition-colors cursor-pointer"
                  >
                    <span>View Curated Tech Reel</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* VIEW 3: RECOMMENDATION CARD */}
            {activeView === 'recommendation' && analysisResult && (
              <div className="space-y-6">
                <RecommendationCard
                  analysis={analysisResult}
                  catalog={CATALOG}
                  onOpenReasoning={() => setShowReasoningModal(true)}
                  source={analysisSource}
                  latencyMs={analysisLatency}
                  activeReels={currentSession.reels}
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Reasoning Graph Modal (WOW Feature) */}
      {showReasoningModal && analysisResult && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowReasoningModal(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fadeIn overflow-y-auto"
        >
          <div className="w-full max-w-4xl rounded-3xl bg-white shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white">
                  <Sparkles className="h-4 w-4" />
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Full 4-Stage Reasoning Transparency Graph
                </h3>
              </div>

              <button
                onClick={() => setShowReasoningModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 sm:p-6 max-h-[80vh] overflow-y-auto">
              <ReasoningReveal analysis={analysisResult} catalog={CATALOG} />
            </div>

            <div className="border-t border-slate-200 bg-slate-50 px-6 py-3 text-right">
              <button
                onClick={() => setShowReasoningModal(false)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close Reasoning Graph
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Catalog Modal */}
      <CatalogModal
        catalog={CATALOG}
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
        selectedId={analysisResult?.recommended_reel_id}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Reels Recommendation System</span>
            <span>• AI Interest Inference & Tech Recommender</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            {analysisSource === 'gemini' ? (
              <span className="font-semibold text-emerald-600">⚡ Powered by Gemini 3.6 Flash</span>
            ) : analysisSource === 'fallback' ? (
              <span className="font-semibold text-amber-600">🔧 Fallback Reasoning Engine Active</span>
            ) : (
              <span className="text-slate-400">Analyze a session to begin</span>
            )}
            <span>•</span>
            <span>Grounded Curated Catalog</span>
            <span>•</span>
            <span>Anti-Hype Filter</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

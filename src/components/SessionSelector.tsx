import React from 'react';
import { Session } from '../lib/types';
import { AlertTriangle, CheckCircle2, SlidersHorizontal, Eye, Dices, Sparkles, ShieldAlert } from 'lucide-react';

interface SessionSelectorProps {
  sessions: Session[];
  activeSessionId: string;
  onSelectSession: (sessionId: string) => void;
  onRandomizeFeed?: () => void;
  disabled?: boolean;
}

export const SessionSelector: React.FC<SessionSelectorProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onRandomizeFeed,
  disabled = false,
}) => {
  const currentSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const isCustomSession = activeSessionId.startsWith('custom_');

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white/90 backdrop-blur-sm p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Select Benchmark Student Session
            </h2>
            <span className="rounded-full bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
              {sessions.length} Test Profiles
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Select a benchmark scenario or click <strong className="text-indigo-600 font-semibold">Random Student Feed</strong> to test dynamic multi-topic inference with simulated watch telemetry.
          </p>
        </div>

        {/* Action Controls: Randomize & Session Select */}
        <div className="flex flex-wrap items-center gap-2">
          {onRandomizeFeed && (
            <button
              type="button"
              onClick={onRandomizeFeed}
              disabled={disabled}
              className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-purple-200 hover:shadow-purple-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer"
              title="Generate a completely randomized mix of reels with simulated watch telemetry"
            >
              <Dices className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
              <span>🎲 Random Student Feed</span>
            </button>
          )}

          <div className="w-full sm:w-60">
            <label htmlFor="session-select" className="sr-only">
              Select Session
            </label>
            <select
              id="session-select"
              value={activeSessionId}
              onChange={(e) => onSelectSession(e.target.value)}
              disabled={disabled}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-2xs focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-100 cursor-pointer"
            >
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Session Pills / Grid */}
      <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {sessions.map((session, index) => {
          const isSelected = session.id === activeSessionId;
          const isCritical = session.id === 'session_1';

          return (
            <button
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              disabled={disabled}
              className={`group relative flex flex-col justify-between rounded-2xl border p-3.5 text-left transition-all cursor-pointer ${
                isSelected
                  ? 'border-indigo-600 bg-gradient-to-b from-indigo-50/80 to-white shadow-glow-indigo/20 ring-2 ring-indigo-600/30'
                  : 'border-slate-200/90 bg-white hover:border-indigo-200 hover:bg-slate-50/80 hover:shadow-2xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={`text-[11px] font-extrabold tracking-wider ${
                      isSelected ? 'text-indigo-900' : 'text-slate-700'
                    }`}
                  >
                    #{index + 1} {session.id.toUpperCase().replace('_', ' ')}
                  </span>
                  {isCritical && (
                    <span className="rounded-md bg-amber-100 border border-amber-300/70 px-1.5 py-0.2 text-[9px] font-black text-amber-900 uppercase tracking-tight shadow-2xs">
                      Trap Test
                    </span>
                  )}
                </div>
                <h3
                  className={`mt-1.5 text-xs font-bold line-clamp-1 leading-snug ${
                    isSelected ? 'text-indigo-950' : 'text-slate-900'
                  }`}
                >
                  {session.name.replace(/^Session \d+:\s*/, '')}
                </h3>
                <p className="mt-1 text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {session.tagline}
                </p>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] text-slate-400">
                <span className="font-medium text-slate-500">{session.reels.length} Reels</span>
                {isSelected ? (
                  <span className="font-bold text-indigo-600 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Active
                  </span>
                ) : (
                  <span className="text-slate-400 group-hover:text-indigo-600 font-semibold transition-colors">Select →</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Session Context Banner */}
      {currentSession && (
        <div className="mt-4 rounded-2xl bg-gradient-to-r from-slate-50 to-indigo-50/30 border border-slate-200/90 p-4 shadow-2xs">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Hypothesis Goal:
              </span>
              <span className="rounded-md bg-indigo-100/80 px-2 py-0.5 text-xs font-bold text-indigo-800">
                {currentSession.expected_inference}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{currentSession.description}</p>
          </div>
          {currentSession.trap_warning && (
            <div className="mt-3 flex items-start gap-2.5 rounded-xl bg-amber-50 border border-amber-200/80 p-3 text-xs text-amber-950 shadow-2xs">
              <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
              <div className="leading-relaxed">
                <strong className="font-bold text-amber-900">Agent Defense Challenge: </strong>
                {currentSession.trap_warning}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

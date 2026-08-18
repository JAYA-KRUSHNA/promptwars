import React from 'react';
import { Session } from '../lib/types';
import { AlertTriangle, CheckCircle2, Dices, ShieldAlert } from 'lucide-react';

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

  return (
    <div className="glass-card rounded-2xl p-5 sm:p-6 transition-all">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold tracking-tight text-slate-900">
              Benchmark Student Watch Sessions
            </h2>
            <span className="rounded-md bg-indigo-50 border border-indigo-100/80 px-2 py-0.5 text-[11px] font-bold text-indigo-700 font-mono">
              {sessions.length} Profiles
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            Select a benchmark scenario or click <strong className="text-indigo-600 font-semibold">Random Student Feed</strong> to test real-time intent shifts with simulated telemetry.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {onRandomizeFeed && (
            <button
              type="button"
              onClick={onRandomizeFeed}
              disabled={disabled}
              className="flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:shadow-sm disabled:opacity-50 transition-all cursor-pointer"
              title="Generate a completely randomized mix of reels with simulated watch telemetry"
            >
              <Dices className="h-4 w-4 text-indigo-400" />
              <span>Random Student Feed</span>
            </button>
          )}

          <div className="w-full sm:w-56">
            <select
              value={activeSessionId}
              onChange={(e) => onSelectSession(e.target.value)}
              disabled={disabled}
              className="w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-xs font-semibold text-slate-800 shadow-2xs focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-100 cursor-pointer"
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

      {/* Session Cards Grid */}
      <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {sessions.map((session, index) => {
          const isSelected = session.id === activeSessionId;
          const isCritical = session.id === 'session_1';

          return (
            <button
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              disabled={disabled}
              className={`flex flex-col justify-between rounded-xl border p-3.5 text-left transition-all duration-150 cursor-pointer ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/40 shadow-xs ring-1 ring-indigo-600/30'
                  : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={`text-[10px] font-bold tracking-wider font-mono ${
                      isSelected ? 'text-indigo-900' : 'text-slate-500'
                    }`}
                  >
                    #{index + 1} {session.id.toUpperCase().replace('_', ' ')}
                  </span>
                  {isCritical && (
                    <span className="rounded bg-amber-100/90 border border-amber-200 px-1 py-0.2 text-[9px] font-black text-amber-900 uppercase">
                      Trap Test
                    </span>
                  )}
                </div>
                <h3
                  className={`mt-1.5 text-xs font-bold line-clamp-1 ${
                    isSelected ? 'text-indigo-950' : 'text-slate-900'
                  }`}
                >
                  {session.name.replace(/^Session \d+:\s*/, '')}
                </h3>
                <p className="mt-1 text-[11px] text-slate-500 line-clamp-2 leading-relaxed font-normal">
                  {session.tagline}
                </p>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] text-slate-400">
                <span className="font-medium text-slate-500">{session.reels.length} Reels</span>
                {isSelected ? (
                  <span className="font-bold text-indigo-600 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Active
                  </span>
                ) : (
                  <span className="text-slate-400 group-hover:text-slate-600">Select →</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Session Context Banner */}
      {currentSession && (
        <div className="mt-4 rounded-xl bg-slate-50/80 border border-slate-200/80 p-3.5">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Hypothesis Goal:
              </span>
              <span className="rounded-md bg-white border border-slate-200 px-2 py-0.5 text-xs font-bold text-indigo-700">
                {currentSession.expected_inference}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed pt-0.5">{currentSession.description}</p>
          </div>
          {currentSession.trap_warning && (
            <div className="mt-2.5 flex items-start gap-2.5 rounded-lg bg-amber-50/80 border border-amber-200/70 p-2.5 text-xs text-amber-950">
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

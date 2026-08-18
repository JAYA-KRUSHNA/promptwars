import React from 'react';
import { Session } from '../lib/types';
import { AlertTriangle, CheckCircle2, SlidersHorizontal, Eye } from 'lucide-react';

interface SessionSelectorProps {
  sessions: Session[];
  activeSessionId: string;
  onSelectSession: (sessionId: string) => void;
  disabled?: boolean;
}

export const SessionSelector: React.FC<SessionSelectorProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  disabled = false,
}) => {
  const currentSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-slate-900">Select Test Student Session</h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
              5 Calibration Testbeds
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            Pick a simulated student watch session to evaluate how the agent extracts implicit intent.
          </p>
        </div>

        {/* Dropdown for quick selection */}
        <div className="w-full sm:w-80">
          <label htmlFor="session-select" className="sr-only">
            Select Session
          </label>
          <select
            id="session-select"
            value={activeSessionId}
            onChange={(e) => onSelectSession(e.target.value)}
            disabled={disabled}
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-800 shadow-xs focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-100 cursor-pointer"
          >
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Session Pills / Grid */}
      <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
        {sessions.map((session) => {
          const isSelected = session.id === activeSessionId;
          const isCritical = session.id === 'session_1';

          return (
            <button
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              disabled={disabled}
              className={`group flex flex-col justify-between rounded-xl border p-3 text-left transition-all cursor-pointer ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-600'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold ${
                      isSelected ? 'text-indigo-950' : 'text-slate-700'
                    }`}
                  >
                    {session.id.toUpperCase().replace('_', ' ')}
                  </span>
                  {isCritical && (
                    <span className="rounded-sm bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                      Trap Test
                    </span>
                  )}
                </div>
                <h3
                  className={`mt-1 text-xs font-semibold line-clamp-1 ${
                    isSelected ? 'text-indigo-900' : 'text-slate-900'
                  }`}
                >
                  {session.name.replace(/^Session \d+:\s*/, '')}
                </h3>
                <p className="mt-1 text-[11px] text-slate-500 line-clamp-2">
                  {session.tagline}
                </p>
              </div>

              <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] text-slate-400">
                <span>{session.reels.length} Reels</span>
                {isSelected ? (
                  <span className="font-semibold text-indigo-600 flex items-center gap-1">
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
        <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200/80 p-3.5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Session Hypothesis:
                </span>
                <span className="text-xs font-semibold text-indigo-700">
                  {currentSession.expected_inference}
                </span>
              </div>
              <p className="text-xs text-slate-600">{currentSession.description}</p>
            </div>
          </div>
          {currentSession.trap_warning && (
            <div className="mt-2.5 flex items-start gap-2 rounded-lg bg-amber-50/80 border border-amber-200/70 p-2.5 text-xs text-amber-900">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
              <span>{currentSession.trap_warning}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

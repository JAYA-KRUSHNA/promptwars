import React, { useState, useEffect } from 'react';
import { X, Key, Cpu, CheckCircle2, AlertCircle, Sparkles, RefreshCw, Trash2, ExternalLink } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  selectedModel: string;
  onSaveModel: (model: string) => void;
  hasServerKey: boolean | null;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
  selectedModel,
  onSaveModel,
  hasServerKey,
}) => {
  const [localKey, setLocalKey] = useState<string>(apiKey);
  const [localModel, setLocalModel] = useState<string>(selectedModel);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    setLocalKey(apiKey);
    setLocalModel(selectedModel);
    setTestResult(null);
  }, [isOpen, apiKey, selectedModel]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleTestKey = async () => {
    const keyToTest = localKey.trim();
    if (!keyToTest) {
      setTestResult({ success: false, message: 'Please enter a Gemini API key first.' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const ai = new GoogleGenAI({ apiKey: keyToTest });
      const response = await ai.models.generateContent({
        model: localModel || 'gemini-2.5-flash',
        contents: 'Ping test: respond with OK',
        config: {
          abortSignal: AbortSignal.timeout(10000),
        },
      });

      if (response.text) {
        setTestResult({
          success: true,
          message: `Connection successful! ${localModel} responded: "${response.text.trim()}"`,
        });
      } else {
        throw new Error('Empty response from model');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown connection error';
      setTestResult({
        success: false,
        message: `Connection failed: ${msg}`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    onSaveApiKey(localKey.trim());
    onSaveModel(localModel);
    onClose();
  };

  const handleClear = () => {
    setLocalKey('');
    onSaveApiKey('');
    setTestResult(null);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md animate-fadeIn"
    >
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-4 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
              <Key className="h-4 w-4" />
            </div>
            <div>
              <h3 id="settings-modal-title" className="text-base font-bold text-slate-900">
                Gemini API & Model Settings
              </h3>
              <p className="text-xs text-slate-500">
                Configure your API key for live AI inference
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close settings modal"
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Server status indicator */}
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 flex items-center justify-between text-xs">
            <span className="font-medium text-slate-600">Vercel Server Environment Key:</span>
            <span
              className={`rounded-md px-2 py-0.5 font-bold uppercase text-[10px] ${
                hasServerKey
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {hasServerKey ? 'Configured' : 'Not Set in Env'}
            </span>
          </div>

          {/* Custom API Key Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">
                Custom Gemini API Key
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:underline"
              >
                <span>Get a Free API Key</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <input
              type="password"
              placeholder="AIzaSy... or paste your Gemini API key"
              value={localKey}
              onChange={(e) => setLocalKey(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden shadow-2xs"
            />
            <p className="text-[11px] text-slate-500">
              Stored securely in your browser's <code className="bg-slate-100 px-1 py-0.2 rounded text-[10px]">localStorage</code>. Overrides server env key.
            </p>
          </div>

          {/* Model Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-indigo-600" />
              <span>Target Gemini Model</span>
            </label>
            <select
              value={localModel}
              onChange={(e) => setLocalModel(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden shadow-2xs cursor-pointer"
            >
              <option value="gemini-2.5-flash">gemini-2.5-flash (Recommended — Fast & Free Tier Quota)</option>
              <option value="gemini-2.0-flash">gemini-2.0-flash (Ultra Fast)</option>
              <option value="gemini-1.5-flash">gemini-1.5-flash (High Availability)</option>
              <option value="gemini-3.6-flash">gemini-3.6-flash (Advanced Preview)</option>
            </select>
          </div>

          {/* Test connection result */}
          {testResult && (
            <div
              className={`rounded-xl p-3 text-xs flex items-start gap-2.5 border ${
                testResult.success
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  : 'bg-rose-50 text-rose-900 border-rose-200'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span className="leading-relaxed">{testResult.message}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 bg-slate-50">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTestKey}
              disabled={isTesting || !localKey.trim()}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
            </button>

            {localKey && (
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-rose-600 transition-colors cursor-pointer px-2"
                title="Clear custom key"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-xs font-bold text-white shadow-xs shadow-indigo-200 transition-colors cursor-pointer"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import { useMemo, useState } from 'react';
import {
  DEFAULT_APP_SETTINGS,
  getSensitivityProfile,
  loadAppSettings,
  resetAppSettings,
  saveAppSettings,
} from '../lib/userPreferences';

function toPercent(value) {
  return `${Math.round(value * 100)}%`;
}

export default function Settings() {
  const [draft, setDraft] = useState(() => loadAppSettings());
  const [status, setStatus] = useState('');

  const profile = useMemo(() => getSensitivityProfile(draft.llmSensitivity), [draft.llmSensitivity]);

  const onSave = () => {
    const saved = saveAppSettings(draft);
    setDraft(saved);
    setStatus('Settings saved. New values will be used in your next query.');
  };

  const onReset = () => {
    const defaults = resetAppSettings();
    setDraft(defaults);
    setStatus('Defaults restored.');
  };

  return (
    <main className="flex-1 h-full bg-base overflow-y-auto p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-[24px] font-semibold tracking-[-0.01em] text-text-primary">Settings</h1>
          <p className="text-[13px] text-text-secondary mt-1">
            Tune model behavior and retrieval depth for the command center.
          </p>
        </div>

        {status && (
          <div className="mb-6 border border-accent bg-accent-ghost text-accent-soft text-[12px] font-medium tracking-[0.02em] px-4 py-3">
            {status}
          </div>
        )}

        <section className="bg-surface-raised border border-border p-5 mb-5">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="text-[16px] font-semibold text-text-primary">LLM Sensitivity</h2>
              <p className="text-[13px] text-text-secondary mt-1">Controls response creativity (mapped to model temperature).</p>
            </div>
            <span className="text-[11px] font-bold tracking-[0.05em] uppercase border border-border bg-base text-text-secondary px-2 py-1">
              {profile.label}
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={draft.llmSensitivity}
            onChange={(e) => {
              const value = Number(e.target.value);
              setDraft((prev) => ({ ...prev, llmSensitivity: value }));
              setStatus('');
            }}
            className="w-full accent-accent"
          />

          <div className="mt-2 flex justify-between text-[12px] text-text-secondary">
            <span>Strict (0%)</span>
            <span className="text-text-primary">Current: {toPercent(draft.llmSensitivity)}</span>
            <span>Creative (100%)</span>
          </div>

          <p className="mt-3 text-[12px] text-text-muted">{profile.description}</p>
        </section>

        <section className="bg-surface-raised border border-border p-5">
          <div className="mb-4">
            <h2 className="text-[16px] font-semibold text-text-primary">Retrieval Depth</h2>
            <p className="text-[13px] text-text-secondary mt-1">Number of chunks fetched per query.</p>
          </div>

          <input
            type="range"
            min="2"
            max="20"
            step="1"
            value={draft.retrievalK}
            onChange={(e) => {
              const value = Number(e.target.value);
              setDraft((prev) => ({ ...prev, retrievalK: value }));
              setStatus('');
            }}
            className="w-full accent-accent"
          />

          <div className="mt-2 flex justify-between text-[12px] text-text-secondary">
            <span>Fast (Top-2)</span>
            <span className="text-text-primary">Current: Top-{draft.retrievalK}</span>
            <span>Deep (Top-20)</span>
          </div>
        </section>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onSave}
            className="bg-accent text-white text-[11px] font-bold tracking-[0.05em] uppercase px-5 py-2.5 hover:opacity-90 transition-opacity cursor-pointer"
          >
            Save Settings
          </button>
          <button
            onClick={onReset}
            className="border border-border text-text-primary text-[11px] font-bold tracking-[0.05em] uppercase px-5 py-2.5 hover:border-accent transition-colors cursor-pointer"
          >
            Reset Defaults
          </button>
          <button
            onClick={() => {
              setDraft({ ...DEFAULT_APP_SETTINGS });
              setStatus('Draft reset. Click Save Settings to apply.');
            }}
            className="border border-border text-text-secondary text-[11px] font-bold tracking-[0.05em] uppercase px-5 py-2.5 hover:text-text-primary transition-colors cursor-pointer"
          >
            Reset Draft
          </button>
        </div>
      </div>
    </main>
  );
}

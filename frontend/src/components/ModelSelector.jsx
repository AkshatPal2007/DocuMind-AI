import { useState, useEffect } from 'react';
import { api } from '../api/client';

const PROVIDER_ICONS = {
  gemini: '✦',
  nvidia: '◆',
  groq: '⚡',
};

const PROVIDER_COLORS = {
  gemini: 'text-blue-400',
  nvidia: 'text-[#76b900]',
  groq: 'text-amber',
};

export default function ModelSelector({ selectedModel, onModelChange }) {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    api.getModels().then((m) => {
      setModels(m);
      // Auto-select first available model if none selected
      if (!selectedModel && m.length > 0) {
        onModelChange(m[0].id);
      }
      setLoading(false);
    });
  }, []);

  const selected = models.find(m => m.id === selectedModel);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-[12px] text-text-secondary border border-border bg-surface-raised px-3 py-1.5 rounded">
        <div className="w-3 h-3 border border-accent border-t-transparent rounded-full animate-spin" />
        Loading models...
      </div>
    );
  }

  if (models.length === 0) {
    return (
      <div className="flex items-center gap-2 text-[12px] text-red border border-red/30 bg-red-bg/20 px-3 py-1.5 rounded">
        <span className="material-symbols-outlined text-[14px]">warning</span>
        No API keys configured
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-[12px] font-medium border border-border bg-surface-raised px-3 py-1.5 rounded hover:border-accent transition-colors cursor-pointer"
      >
        {selected && (
          <span className={PROVIDER_COLORS[selected.provider]}>
            {PROVIDER_ICONS[selected.provider]}
          </span>
        )}
        <span className="text-text-primary">{selected?.name || 'Select Model'}</span>
        <span className="material-symbols-outlined text-[14px] text-text-secondary">
          {open ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {open && (
        <div className="absolute top-full mt-1 right-0 w-72 bg-surface-raised border border-border rounded shadow-xl z-50 overflow-hidden animate-fadeIn">
          {/* Group by provider */}
          {['nvidia', 'gemini', 'groq'].map(provider => {
            const providerModels = models.filter(m => m.provider === provider);
            if (providerModels.length === 0) return null;

            return (
              <div key={provider}>
                <div className="px-3 py-1.5 text-[10px] font-bold tracking-[0.05em] uppercase text-text-muted bg-base border-b border-border">
                  <span className={PROVIDER_COLORS[provider]}>{PROVIDER_ICONS[provider]}</span>
                  {' '}{provider}
                </div>
                {providerModels.map(m => (
                  <button
                    key={m.id}
                    onClick={() => { onModelChange(m.id); setOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-[13px] flex items-center justify-between hover:bg-base transition-colors cursor-pointer ${
                      m.id === selectedModel ? 'text-accent bg-accent/5' : 'text-text-primary'
                    }`}
                  >
                    <span>{m.name}</span>
                    {m.id === selectedModel && (
                      <span className="material-symbols-outlined text-[14px] text-accent">check</span>
                    )}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { clearActivityLog, getActivityLog } from '../lib/activityLog';

function formatTime(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '--';
  return date.toLocaleString();
}

export default function Activity() {
  const [events, setEvents] = useState(() => getActivityLog());

  const refresh = () => setEvents(getActivityLog());

  const clearAll = () => {
    clearActivityLog();
    setEvents([]);
  };

  return (
    <main className="flex-1 h-full bg-base overflow-y-auto p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-[24px] font-semibold tracking-[-0.01em] text-text-primary">Activity</h1>
            <p className="text-[13px] text-text-secondary mt-1">Recent query history, settings, and outcomes.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={refresh}
              className="border border-border text-text-primary text-[11px] font-bold tracking-[0.05em] uppercase px-4 py-2 hover:border-accent transition-colors cursor-pointer"
            >
              Refresh
            </button>
            <button
              onClick={clearAll}
              className="border border-border text-red text-[11px] font-bold tracking-[0.05em] uppercase px-4 py-2 hover:border-red transition-colors cursor-pointer"
            >
              Clear Log
            </button>
          </div>
        </div>

        {events.length === 0 ? (
          <div className="bg-surface-raised border border-border p-10 text-center">
            <span className="material-symbols-outlined text-[40px] text-text-dim">history</span>
            <h2 className="text-[18px] font-semibold mt-3 text-text-primary">No activity yet</h2>
            <p className="text-[13px] text-text-secondary mt-2">Run a query in Intelligence to populate this panel.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <article key={event.id} className="bg-surface-raised border border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-[11px] font-bold tracking-[0.05em] uppercase text-text-secondary">
                    {event.status === 'success' ? 'Success' : 'Error'}
                  </div>
                  <div className="text-[12px] text-text-muted">{formatTime(event.timestamp)}</div>
                </div>

                <p className="text-[14px] text-text-primary mt-3">{event.question || 'No question recorded'}</p>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-[12px]">
                  <div className="border border-border bg-base px-2 py-1 text-text-secondary">Model: <span className="text-text-primary">{event.model || 'Automatic'}</span></div>
                  <div className="border border-border bg-base px-2 py-1 text-text-secondary">Scope: <span className="text-text-primary">{event.document || 'All documents'}</span></div>
                  <div className="border border-border bg-base px-2 py-1 text-text-secondary">Sensitivity: <span className="text-text-primary">{Math.round((event.sensitivity ?? 0) * 100)}%</span></div>
                  <div className="border border-border bg-base px-2 py-1 text-text-secondary">Top-K: <span className="text-text-primary">{event.retrievalK ?? '--'}</span></div>
                </div>

                {event.status === 'success' && (
                  <p className="text-[12px] text-green mt-3">Attempts: {event.attempts ?? 1}</p>
                )}

                {event.status === 'error' && event.error && (
                  <p className="text-[12px] text-red mt-3">{event.error}</p>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

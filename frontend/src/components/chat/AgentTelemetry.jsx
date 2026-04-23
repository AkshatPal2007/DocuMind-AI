const STEPS = [
  { key: 'retrieve', icon: 'search', label: 'Retrieval Agent' },
  { key: 'reason', icon: 'schema', label: 'Reasoning Agent' },
  { key: 'critique', icon: 'fact_check', label: 'Critique Agent' },
  { key: 'summarize', icon: 'summarize', label: 'Summary Agent' },
];

function StepStatus({ status }) {
  if (status === 'running')
    return <span className="text-accent animate-pulse-glow text-[12px] font-medium">Processing...</span>;
  if (status === 'done')
    return <span className="text-green text-[12px] font-medium">Complete</span>;
  return <span className="text-text-muted text-[12px] font-medium">Waiting</span>;
}

export default function AgentTelemetry({ telemetry, metadata, modelName }) {
  return (
    <div className="w-80 border-l border-border bg-surface flex flex-col h-full shrink-0">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center gap-2 bg-surface-raised">
        <span className="material-symbols-outlined text-accent-soft text-[18px]">account_tree</span>
        <span className="text-[11px] font-bold tracking-[0.05em] text-accent uppercase">Agent Telemetry</span>
      </div>

      {/* Steps */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-0 relative">
        {/* Vertical connection line */}
        <div className="absolute left-[27px] top-6 bottom-8 w-px bg-border z-0" />

        {STEPS.map((step, i) => {
          const stepData = telemetry?.[step.key];
          const status = stepData?.status || 'waiting';
          const isActive = status === 'running';

          return (
            <div key={step.key} className="relative z-10 flex gap-3 pb-6 animate-fadeIn" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="mt-1 flex flex-col items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isActive
                    ? 'bg-accent/20 border border-accent'
                    : status === 'done'
                    ? 'bg-green-dim border border-green'
                    : 'bg-surface-overlay border border-border-subtle'
                }`}>
                  <span className={`material-symbols-outlined text-[12px] ${
                    isActive ? 'text-accent-soft' : status === 'done' ? 'text-green' : 'text-text-secondary'
                  }`}>{step.icon}</span>
                </div>
              </div>
              <div className="flex-1">
                <div className={`text-[13px] font-medium tracking-[0.02em] mb-1 ${isActive ? 'text-accent' : 'text-text-primary'}`}>
                  {step.label}
                </div>
                <div className={`border rounded p-2 text-[12px] font-medium tracking-[0.02em] text-text-secondary ${
                  isActive ? 'bg-surface-high border-accent' : 'bg-surface-overlay border-border'
                }`}>
                  <div className="flex justify-between items-center mb-1">
                    <StepStatus status={status} />
                    <span>{stepData?.time || '--'}</span>
                  </div>
                  {stepData?.logs?.map((log, j) => (
                    <div key={j} className="text-text-primary/70">&gt; {log}</div>
                  ))}
                  {!stepData?.logs?.length && status === 'waiting' && (
                    <div className="text-text-muted">&gt; Awaiting previous step</div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t border-border bg-surface-raised">
        <div className="grid grid-cols-2 gap-2 text-[12px] font-medium tracking-[0.02em] text-text-secondary">
          <div>Attempts: <span className="text-text-primary">{metadata?.attempts || '--'}</span></div>
          <div>Grounded: <span className={metadata?.grounded ? 'text-green' : metadata?.grounded === false ? 'text-red' : 'text-text-primary'}>
            {metadata?.grounded === true ? 'Yes ✓' : metadata?.grounded === false ? 'No ✗' : '--'}
          </span></div>
          <div className="col-span-2">Model: <span className="text-text-primary">{modelName || '--'}</span></div>
        </div>
      </div>
    </div>
  );
}

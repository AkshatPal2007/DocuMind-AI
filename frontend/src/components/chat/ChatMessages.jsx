export function UserMessage({ text }) {
  return (
    <div className="flex flex-col gap-2 max-w-3xl ml-auto animate-fadeIn">
      <div className="flex items-center justify-end gap-2 text-text-secondary mb-1">
        <span className="text-[11px] font-bold tracking-[0.05em] uppercase">User</span>
        <span className="material-symbols-outlined text-[16px]">person</span>
      </div>
      <div className="bg-surface-raised border border-border p-4 rounded-lg rounded-tr-none text-text-primary text-[14px]">
        {text}
      </div>
    </div>
  );
}

export function AIMessage({ text, metadata, sources }) {
  // Parse [Source N] references and style them
  const renderText = (raw) => {
    if (!raw) return null;
    const parts = raw.split(/(\[Source \d+\])/g);
    return parts.map((part, i) => {
      if (/^\[Source \d+\]$/.test(part)) {
        return (
          <span key={i} className="inline-flex items-center justify-center bg-green-dim border border-green text-green text-[10px] font-bold px-1.5 py-0.5 rounded cursor-pointer hover:bg-[#005441] ml-1 align-middle">
            {part}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  // Convert markdown-like formatting
  const renderContent = (raw) => {
    if (!raw) return null;
    const lines = raw.split('\n');
    const elements = [];
    let inList = false;
    let listItems = [];

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`ul-${elements.length}`} className="list-disc pl-5 my-2 flex flex-col gap-1">
            {listItems.map((item, i) => <li key={i} className="text-[14px]">{renderText(item)}</li>)}
          </ul>
        );
        listItems = [];
        inList = false;
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      if (!trimmed) {
        flushList();
        continue;
      }

      // Headings
      if (trimmed.startsWith('### ')) {
        flushList();
        elements.push(<h3 key={i} className="text-[14px] font-semibold text-text-primary mt-3 mb-1">{renderText(trimmed.slice(4))}</h3>);
        continue;
      }
      if (trimmed.startsWith('## ')) {
        flushList();
        elements.push(<h2 key={i} className="text-[16px] font-semibold text-text-primary mt-3 mb-1">{renderText(trimmed.slice(3))}</h2>);
        continue;
      }

      // Bold wrapped text: **text**
      if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
        flushList();
        elements.push(<p key={i} className="text-[14px] font-semibold text-text-primary mt-2">{renderText(trimmed.slice(2, -2))}</p>);
        continue;
      }

      // List items
      if (/^[-*•]\s/.test(trimmed)) {
        inList = true;
        listItems.push(trimmed.replace(/^[-*•]\s/, ''));
        continue;
      }

      flushList();
      elements.push(<p key={i} className="text-[14px] leading-relaxed my-1">{renderText(trimmed)}</p>);
    }
    flushList();
    return elements;
  };

  return (
    <div className="flex flex-col gap-2 max-w-4xl mr-auto w-full relative animate-fadeIn">
      {/* Left accent */}
      <div className="absolute left-[-16px] top-8 bottom-0 w-1 bg-accent" />

      <div className="flex items-center gap-2 text-accent mb-1">
        <span className="material-symbols-outlined text-[16px] font-bold">memory</span>
        <span className="text-[11px] font-bold tracking-[0.05em] uppercase">DocuMind Synthesis</span>
      </div>

      <div className="bg-surface-raised border border-border p-6 rounded-lg rounded-tl-none flex flex-col gap-2 text-text-primary text-[14px]">
        {renderContent(text)}

        {/* Metadata Footer */}
        {metadata && (
          <div className="mt-4 pt-4 border-t border-border flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1 bg-surface-overlay border border-border px-2 py-1 rounded text-[12px] text-text-secondary">
              <span className="material-symbols-outlined text-[14px]">fact_check</span>
              Attempts: {metadata.attempts}
            </div>
            <div className={`flex items-center gap-1 px-2 py-1 rounded text-[12px] border ${
              metadata.grounded
                ? 'bg-green-dim border-green text-green'
                : 'bg-red-bg border-red text-red'
            }`}>
              <span className="material-symbols-outlined text-[14px]">
                {metadata.grounded ? 'check_circle' : 'cancel'}
              </span>
              Grounded: {metadata.grounded ? 'Yes' : 'No'}
            </div>
            <div className="ml-auto flex gap-2">
              <button className="text-text-secondary hover:text-accent transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">thumb_up</span>
              </button>
              <button className="text-text-secondary hover:text-red transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">thumb_down</span>
              </button>
              <button
                className="text-text-secondary hover:text-accent transition-colors cursor-pointer"
                onClick={() => navigator.clipboard.writeText(text)}
              >
                <span className="material-symbols-outlined text-[18px]">content_copy</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sources */}
      {sources?.length > 0 && (
        <details className="mt-1 text-[12px]">
          <summary className="cursor-pointer text-text-secondary hover:text-accent transition-colors">
            View {sources.length} source chunks
          </summary>
          <div className="mt-2 flex flex-col gap-2">
            {sources.map((s, i) => (
              <div key={i} className="bg-surface-overlay border border-border rounded p-3 text-text-secondary text-[12px]">
                <div className="flex justify-between mb-1 text-[11px] font-bold tracking-[0.05em]">
                  <span className="text-accent">Source {i + 1}</span>
                  <span>{s.source} • Page {s.page}</span>
                </div>
                <p className="line-clamp-3">{s.content}</p>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

export function LoadingMessage() {
  return (
    <div className="flex flex-col gap-2 max-w-4xl mr-auto w-full relative animate-fadeIn">
      <div className="absolute left-[-16px] top-8 bottom-4 w-1 bg-accent animate-pulse-glow" />
      <div className="flex items-center gap-2 text-accent mb-1">
        <span className="material-symbols-outlined text-[16px] animate-spin">memory</span>
        <span className="text-[11px] font-bold tracking-[0.05em] uppercase">DocuMind Processing...</span>
      </div>
      <div className="bg-surface-raised border border-accent/30 p-6 rounded-lg rounded-tl-none">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <span className="text-[14px] text-text-secondary">Agents are working on your query...</span>
        </div>
      </div>
    </div>
  );
}

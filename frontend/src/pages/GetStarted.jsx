import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export default function GetStarted() {
  const [status, setStatus] = useState(null); // { msg, type: 'loading'|'success'|'error' }
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null); // { name, chunks }
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFile = useCallback(async (file) => {
    const allowed = ['.pdf', '.txt', '.docx', '.csv'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowed.includes(ext)) {
      setStatus({ msg: `Unsupported: ${ext}. Use PDF, TXT, DOCX, or CSV`, type: 'error' });
      return;
    }

    setUploading(true);
    setStatus({ msg: `Uploading ${file.name}...`, type: 'loading' });

    try {
      const res = await api.uploadFile(file);
      setResult({ name: file.name, chunks: res.chunks });
      setStatus({ msg: `✓ ${file.name} — ${res.chunks} chunks indexed`, type: 'success' });
    } catch (err) {
      setStatus({ msg: `Error: ${err.message}`, type: 'error' });
    } finally {
      setUploading(false);
    }
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const onDragOver = (e) => e.preventDefault();

  return (
    <main className="flex-1 h-full bg-base flex flex-col items-center justify-center p-8 overflow-y-auto relative">
      {/* Dot Grid Background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{ backgroundImage: 'radial-gradient(#2A2D45 1px, transparent 1px)', backgroundSize: '24px 24px' }}
      />

      <div className="w-full max-w-2xl relative z-10 flex flex-col items-center">
        {/* Hero Icon */}
        <div className="w-24 h-24 bg-surface-raised border border-border rounded-full flex items-center justify-center mb-8 relative">
          <div className="absolute inset-0 rounded-full bg-accent opacity-10 blur-xl" />
          <span className="material-symbols-outlined text-[48px] text-accent" style={{ fontVariationSettings: "'wght' 200" }}>psychology</span>
        </div>

        <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-text-primary mb-2 text-center">DocuMind AI</h1>
        <p className="text-[16px] text-text-secondary text-center mb-10 max-w-md">
          Upload a document to begin. The intelligence engine is standing by for interrogation and synthesis.
        </p>

        {/* Status Bar */}
        {status && (
          <div className={`w-full mb-4 text-[13px] font-medium tracking-[0.02em] px-4 py-2 text-center animate-fadeIn ${
            status.type === 'success' ? 'text-green bg-green-dim border border-green-border' :
            status.type === 'error' ? 'text-red bg-red-bg border border-red' :
            'text-accent-soft bg-accent-ghost border border-accent'
          }`}>
            {status.msg}
          </div>
        )}

        {/* Dropzone / Success State */}
        {result ? (
          <div className="w-full bg-surface-raised border border-border p-12 flex flex-col items-center justify-center animate-fadeIn">
            <span className="material-symbols-outlined text-[48px] text-green mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            <h3 className="text-[20px] font-semibold text-text-primary mb-2">{result.name}</h3>
            <p className="text-[14px] text-green mb-6">{result.chunks} chunks indexed successfully</p>
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/chat')}
                className="bg-accent text-white text-[11px] font-bold tracking-[0.05em] uppercase px-6 py-2.5 hover:opacity-90 transition-opacity flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">query_stats</span>
                Open Command Center
              </button>
              <button
                onClick={() => { setResult(null); setStatus(null); }}
                className="border border-border text-text-primary text-[11px] font-bold tracking-[0.05em] uppercase px-6 py-2.5 hover:border-accent transition-colors cursor-pointer"
              >
                Upload Another
              </button>
            </div>
          </div>
        ) : (
          <div
            className="w-full bg-surface-raised border border-dashed border-border-subtle hover:border-accent transition-colors p-12 flex flex-col items-center justify-center cursor-pointer group relative overflow-hidden"
            onDrop={onDrop}
            onDragOver={onDragOver}
            onClick={() => !uploading && fileInputRef.current?.click()}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-accent-ghost to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            {uploading ? (
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                <p className="text-[13px] font-medium text-text-primary">Processing document...</p>
                <p className="text-[14px] text-text-secondary">Chunking & indexing...</p>
              </div>
            ) : (
              <>
                <span className="material-symbols-outlined text-[40px] text-text-secondary group-hover:text-accent transition-colors mb-4" style={{ fontVariationSettings: "'wght' 200" }}>cloud_upload</span>
                <h3 className="text-[20px] font-semibold text-text-primary mb-2">Drop files here</h3>
                <p className="text-[14px] text-text-secondary mb-6">or click to browse local storage</p>

                <div className="flex flex-wrap gap-2 justify-center">
                  {['PDF', 'TXT', 'DOCX', 'CSV'].map(fmt => (
                    <span key={fmt} className="border border-border-subtle text-text-muted text-[13px] font-medium tracking-[0.02em] px-2 py-1 bg-base">{fmt}</span>
                  ))}
                </div>

                <button
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  className="mt-8 bg-transparent border border-border text-text-primary text-[11px] font-bold tracking-[0.05em] uppercase px-6 py-2 hover:border-accent hover:text-accent transition-colors cursor-pointer"
                >
                  Browse Files
                </button>
              </>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.docx,.csv"
              className="hidden"
              onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
            />
          </div>
        )}
      </div>

      {/* Bottom encrypted badge */}
      <div className="absolute bottom-8 text-center w-full">
        <p className="text-[11px] font-bold tracking-[0.05em] text-text-dim uppercase flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-[14px]">lock</span>
          End-to-end encrypted storage
        </p>
      </div>
    </main>
  );
}

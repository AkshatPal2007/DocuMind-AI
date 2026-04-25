import { useState, useEffect } from 'react';
import { api } from '../../api/client';

const FILE_ICONS = {
  '.pdf': { icon: 'picture_as_pdf', color: 'text-red' },
  '.docx': { icon: 'description', color: 'text-accent-soft' },
  '.txt': { icon: 'article', color: 'text-text-secondary' },
  '.csv': { icon: 'table_chart', color: 'text-amber' },
};

function formatSize(bytes) {
  if (!bytes) return 'Unknown size';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

export default function DocumentList({ selectedDoc, onSelectDoc }) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDocs() {
      try {
        const files = await api.getFiles();
        setDocs(files);
      } catch (e) {
        console.error("Failed to load documents", e);
      } finally {
        setLoading(false);
      }
    }
    loadDocs();
    
    // Set up an interval to refresh docs every few seconds if needed
    // or just rely on a refresh trigger. For now, fetch once on mount.
    const interval = setInterval(loadDocs, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-72 border-r border-border bg-surface-raised flex flex-col h-full shrink-0">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex justify-between items-center">
        <span className="text-[11px] font-bold tracking-[0.05em] text-text-secondary uppercase">Indexed Sources</span>
        <span className="material-symbols-outlined text-text-secondary text-[16px] cursor-pointer hover:text-accent">filter_list</span>
      </div>

      {/* Document List */}
      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
        {loading ? (
           <div className="flex justify-center items-center h-20 text-text-secondary">
             <span className="material-symbols-outlined animate-spin">refresh</span>
           </div>
        ) : docs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-text-muted text-[13px] p-4 text-center">
            <span className="material-symbols-outlined text-[32px] mb-2 text-border-subtle">folder_off</span>
            No documents indexed yet.
            <br />Upload a document to begin.
          </div>
        ) : (
          docs.map((doc, i) => {
            const ext = doc.file_name.match(/\.[^.]+$/)?.[0]?.toLowerCase() || '.txt';
            const fileInfo = FILE_ICONS[ext] || FILE_ICONS['.txt'];
            const isSelected = selectedDoc === doc.file_name;

            return (
              <div
                key={doc.id}
                onClick={() => onSelectDoc?.(isSelected ? null : doc.file_name)}
                className={`p-3 border rounded cursor-pointer transition-colors group animate-fadeIn ${
                  isSelected
                    ? 'border-accent-dim bg-surface-high relative overflow-hidden'
                    : 'border-border bg-surface-overlay hover:border-accent-dim'
                }`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-dim" />}
                <div className={`flex items-start gap-2 mb-2 ${isSelected ? 'pl-2' : ''}`}>
                  <span className={`material-symbols-outlined ${fileInfo.color} text-[20px]`}>{fileInfo.icon}</span>
                  <div className="flex-1 truncate">
                    <h4 className={`text-[13px] font-medium tracking-[0.02em] truncate ${isSelected ? 'text-accent-soft' : 'text-text-primary'}`} title={doc.file_name}>
                      {doc.file_name}
                    </h4>
                    <div className="flex gap-2 mt-1">
                      {doc.size && <span className="text-[10px] text-text-secondary font-bold border border-border-subtle px-1 rounded">{formatSize(doc.size)}</span>}
                      <span className="text-[10px] text-green font-bold border border-green px-1 rounded bg-green-dim">Verified</span>
                    </div>
                  </div>
                </div>
                <div className={`flex justify-between items-center text-[12px] text-text-secondary ${isSelected ? 'pl-2' : ''}`}>
                  <span>Indexed: {doc.chunks} chunks</span>
                  <span className={`material-symbols-outlined text-[14px] ${isSelected ? 'text-accent' : 'group-hover:text-accent'}`}>
                    {isSelected ? 'check_circle' : 'arrow_forward'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

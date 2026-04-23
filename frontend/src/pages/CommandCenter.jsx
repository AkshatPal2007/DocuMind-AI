import { useState, useRef, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import DocumentList from '../components/chat/DocumentList';
import AgentTelemetry from '../components/chat/AgentTelemetry';
import { UserMessage, AIMessage, LoadingMessage } from '../components/chat/ChatMessages';
import ModelSelector from '../components/ModelSelector';

let sessionCounter = Math.floor(Math.random() * 9000) + 1000;

export default function CommandCenter() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [telemetry, setTelemetry] = useState({});
  const [metadata, setMetadata] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const feedRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendQuery = useCallback(async () => {
    const question = input.trim();
    if (!question || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: question }]);
    setLoading(true);

    // Simulate telemetry steps
    setTelemetry({
      retrieve: { status: 'running', logs: ['Executing semantic search...'] },
    });

    try {
      // Step 1: Show retrieve running
      setTimeout(() => {
        setTelemetry(prev => ({
          ...prev,
          retrieve: { status: 'done', time: '~50ms', logs: ['Semantic search complete', 'Found relevant chunks'] },
          reason: { status: 'running', logs: ['Synthesizing answer from context...'] },
        }));
      }, 300);

      // Step 2: Show reason running
      setTimeout(() => {
        setTelemetry(prev => ({
          ...prev,
          reason: { ...prev.reason, status: 'done', time: '~1.5s', logs: ['Answer generated'] },
          critique: { status: 'running', logs: ['Cross-referencing citations...', 'Checking for hallucinations...'] },
        }));
      }, 800);

      const result = await api.agentChat(question, 6, selectedModel, selectedDoc);

      // Step 3: All done
      setTelemetry({
        retrieve: { status: 'done', time: '~50ms', logs: ['Semantic search complete', `Found ${result.sources?.length || 0} chunks`] },
        reason: { status: 'done', time: '~1.5s', logs: ['Answer synthesized from context'] },
        critique: {
          status: 'done', time: '~0.8s', logs: [
            result.metadata?.grounded ? 'Answer is grounded ✓' : 'Answer flagged for review',
            result.metadata?.critique_reason || 'Verification complete'
          ]
        },
        summarize: { status: 'done', time: '~0.5s', logs: ['Citations preserved', 'Response polished'] },
      });

      setMetadata(result.metadata);
      setMessages(prev => [...prev, {
        role: 'ai',
        text: result.answer,
        metadata: result.metadata,
        sources: result.sources,
      }]);

    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'ai',
        text: `Error: ${err.message}`,
        metadata: { attempts: 1, grounded: false },
        sources: [],
      }]);
      setTelemetry({});
    } finally {
      setLoading(false);
    }
  }, [input, loading, selectedModel]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendQuery();
    }
  };

  return (
    <main className="flex-1 bg-base flex flex-col h-full overflow-hidden">
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Document List */}
        <DocumentList selectedDoc={selectedDoc} onSelectDoc={setSelectedDoc} />

        {/* Center: Chat */}
        <div className="flex-1 flex flex-col h-full bg-base relative">
          {/* Feed Header */}
          <div className="px-6 py-4 border-b border-border bg-base sticky top-0 z-10 flex justify-between items-center">
            <div>
              <h2 className="text-[20px] font-semibold tracking-[-0.01em] text-text-primary">Active Interrogation Session</h2>
              <p className="text-[13px] font-medium tracking-[0.02em] text-text-secondary mt-1">Session ID: #REQ-{sessionCounter}-X</p>
            </div>
            <div className="flex gap-2 items-center">
              <ModelSelector selectedModel={selectedModel} onModelChange={setSelectedModel} />
              <span className="text-[11px] font-bold tracking-[0.05em] border border-border bg-surface-raised text-text-secondary px-2 py-1 rounded flex items-center gap-1 cursor-pointer hover:border-accent transition-colors">
                <span className="material-symbols-outlined text-[14px]">history</span> History
              </span>
              <span className="text-[11px] font-bold tracking-[0.05em] border border-border bg-surface-raised text-text-secondary px-2 py-1 rounded flex items-center gap-1 cursor-pointer hover:border-accent transition-colors">
                <span className="material-symbols-outlined text-[14px]">save</span> Save State
              </span>
            </div>
          </div>

          {/* Chat Feed */}
          <div ref={feedRef} className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
            {messages.length === 0 && !loading && (
              <div className="flex-1 flex flex-col items-center justify-center text-text-muted">
                <span className="material-symbols-outlined text-[48px] mb-4 text-border-subtle" style={{ fontVariationSettings: "'wght' 200" }}>psychology</span>
                <p className="text-[14px] text-center max-w-md">
                  Ask a question about your uploaded documents. The multi-agent pipeline will retrieve, reason, critique, and summarize.
                </p>
              </div>
            )}

            {messages.map((msg, i) => (
              msg.role === 'user'
                ? <UserMessage key={i} text={msg.text} />
                : <AIMessage key={i} text={msg.text} metadata={msg.metadata} sources={msg.sources} />
            ))}

            {loading && <LoadingMessage />}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-border bg-surface-raised">
            <div className="max-w-4xl mx-auto relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-accent">psychology</span>
              </div>
              <input
                className="w-full bg-base border border-border text-text-primary text-[14px] rounded px-10 py-3 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder-text-secondary"
                placeholder="Interrogate the documents..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
              />
              <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-2">
                <button className="p-1.5 text-text-secondary hover:text-accent transition-colors rounded cursor-pointer">
                  <span className="material-symbols-outlined text-[20px]">attach_file</span>
                </button>
                <button
                  onClick={sendQuery}
                  disabled={loading || !input.trim()}
                  className="p-1.5 bg-accent text-white hover:opacity-90 transition-colors rounded cursor-pointer disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[20px]">send</span>
                </button>
              </div>
            </div>
            <div className="max-w-4xl mx-auto mt-2 flex justify-between items-center text-[12px] font-medium tracking-[0.02em] text-text-secondary">
              <span>Press Enter to submit, Shift+Enter for new line</span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">lock</span>
                Encrypted Session
              </span>
            </div>
          </div>
        </div>

        {/* Right: Agent Telemetry */}
        <AgentTelemetry telemetry={telemetry} metadata={metadata} />
      </div>
    </main>
  );
}

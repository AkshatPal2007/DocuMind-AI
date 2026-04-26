import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrainCircuit, Database, SearchCheck, ShieldCheck, Sparkles, X, ChevronRight, Play } from 'lucide-react';
import Auth from './Auth';
import { useAuth } from '../contexts/AuthContext';

const FEATURE_CARDS = [
  {
    icon: SearchCheck,
    title: 'Semantic Document Search',
    description: 'Go beyond keywords. Ask natural questions and retrieve the most relevant insights from your data instantly.',
  },
  {
    icon: Sparkles,
    title: 'Multi-Agent Intelligence',
    description: 'Our specialized agents handle retrieval, reasoning, and critique to ensure grounded and accurate answers.',
  },
  {
    icon: ShieldCheck,
    title: 'Citations and Trust',
    description: 'Every response is backed by document evidence. No hallucinations, just verifiable knowledge.',
  },
  {
    icon: Database,
    title: 'Private Knowledge Layer',
    description: 'Your documents are indexed into a secure, private workspace, optimized for rapid interrogation.',
  },
];

const WORKFLOW_STEPS = [
  { title: 'Ingest', desc: 'Upload PDFs, DOCX, or TXT files securely.' },
  { title: 'Index', desc: 'Documents are chunked and embedded for semantic retrieval.' },
  { title: 'Interact', desc: 'Chat with your knowledge base via our command center.' },
  { title: 'Extract', desc: 'Receive grounded answers with pinpoint citations.' },
];

export default function Landing() {
  const navigate = useNavigate();
  const { session } = useAuth();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  useEffect(() => {
    if (session) {
      navigate('/dashboard', { replace: true });
    }
  }, [session, navigate]);

  const openAuth = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen bg-base text-text-primary selection:bg-accent/40 font-sans overflow-x-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
      <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-accent/10 blur-[120px] pointer-events-none translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-cyan-500/5 blur-[100px] pointer-events-none -translate-x-1/2 translate-y-1/2" />

      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-40 border-b border-border/40 bg-base/60 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="h-10 w-10 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/20 transition-transform group-hover:scale-105">
              <BrainCircuit size={24} className="text-white" />
            </div>
            <span className="text-[20px] font-bold tracking-tight bg-gradient-to-r from-white to-text-secondary bg-clip-text text-transparent">DocuMind AI</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">Features</a>
            <a href="#workflow" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">How it works</a>
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={() => openAuth('login')}
              className="text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors px-4 py-2"
            >
              Log In
            </button>
            <button
              onClick={() => openAuth('signup')}
              className="text-sm font-bold bg-accent text-white px-6 py-2.5 rounded-full hover:opacity-90 transition-all shadow-lg shadow-accent/20 active:scale-95"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      <main className="relative pt-20">
        {/* Hero Section */}
        <section className="mx-auto max-w-7xl px-6 pt-24 pb-20 lg:pt-32 lg:pb-40 grid lg:grid-cols-2 gap-16 items-center">
          <div className="animate-fadeIn">
            <div className="inline-flex items-center gap-2 border border-accent/20 bg-accent-ghost px-4 py-1.5 rounded-full text-[12px] font-bold tracking-wide uppercase text-accent-soft mb-8">
              <Sparkles size={14} />
              <span>Intelligent Document RAG</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight mb-8">
              Chat with your <br />
              <span className="text-gradient">Documents.</span>
            </h1>
            <p className="text-lg md:text-xl text-text-secondary leading-relaxed max-w-xl mb-10">
              Transform static PDFs and files into an interactive knowledge engine. 
              Our multi-agent system retrieves, reasons, and synthesizes answers you can trust.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => openAuth('signup')}
                className="bg-accent text-white font-bold px-8 py-4 rounded-full hover:opacity-90 transition-all flex items-center gap-2 group shadow-xl shadow-accent/25"
              >
                Launch Workspace
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                className="border border-border bg-surface/40 backdrop-blur-sm text-text-primary font-bold px-8 py-4 rounded-full hover:border-accent/50 transition-all flex items-center gap-2"
              >
                <Play size={16} fill="currentColor" />
                See it in action
              </button>
            </div>
          </div>

          <div className="relative animate-slideInRight">
            <div className="glass rounded-2xl p-4 glow-shadow relative z-10 overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent pointer-events-none" />
               {/* Mockup of UI */}
               <div className="bg-base/40 rounded-xl border border-border/50 aspect-[4/3] flex flex-col p-6 overflow-hidden">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-dim/50" />
                      <div className="w-3 h-3 rounded-full bg-amber/50" />
                      <div className="w-3 h-3 rounded-full bg-green/50" />
                    </div>
                    <div className="h-6 w-32 bg-border/40 rounded-full" />
                  </div>
                  <div className="space-y-4">
                    <div className="h-4 w-3/4 bg-border/40 rounded-full" />
                    <div className="h-4 w-1/2 bg-border/40 rounded-full opacity-60" />
                    <div className="mt-8 p-4 glass-accent rounded-lg border border-accent/20">
                      <div className="h-3 w-full bg-accent/20 rounded-full mb-2" />
                      <div className="h-3 w-5/6 bg-accent/20 rounded-full mb-2" />
                      <div className="h-3 w-4/6 bg-accent/20 rounded-full" />
                    </div>
                  </div>
               </div>
            </div>
            {/* Floating elements */}
            <div className="absolute -top-6 -left-6 glass-accent p-3 rounded-lg border border-accent/30 animate-pulse-glow z-20">
               <Database size={24} className="text-accent" />
            </div>
            <div className="absolute -bottom-8 -right-4 glass p-4 rounded-xl border border-border/50 shadow-2xl z-20 flex items-center gap-3">
               <div className="h-10 w-10 bg-green/20 rounded-full flex items-center justify-center">
                  <ShieldCheck size={20} className="text-green" />
               </div>
               <div>
                  <div className="text-[10px] font-bold text-text-dim uppercase tracking-wider">Citations Found</div>
                  <div className="text-sm font-semibold">Grounded Evidence</div>
               </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="mx-auto max-w-7xl px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Precision Intelligence</h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              DocuMind uses a specialized agentic workflow to ensure every answer is derived directly from your private documents.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURE_CARDS.map(({ icon: Icon, title, description }) => (
              <article key={title} className="glass p-8 rounded-2xl hover-lift border border-border/30">
                <div className="h-12 w-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent mb-6 border border-accent/20">
                  <Icon size={24} />
                </div>
                <h3 className="text-lg font-bold mb-3">{title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="mx-auto max-w-7xl px-6 py-24 border-t border-border/20">
           <div className="grid lg:grid-cols-3 gap-12">
              <div>
                 <h3 className="text-2xl font-bold mb-4 text-gradient">Built for Professionals</h3>
                 <p className="text-text-secondary">DocuMind adapts to your workflow, providing instant answers where accuracy is non-negotiable.</p>
              </div>
              <div className="lg:col-span-2 grid sm:grid-cols-2 gap-8">
                 <div className="space-y-2">
                    <h4 className="font-bold">Legal & Compliance</h4>
                    <p className="text-sm text-text-secondary">Query complex contracts and compliance documents with pinpoint source verification.</p>
                 </div>
                 <div className="space-y-2">
                    <h4 className="font-bold">Technical Research</h4>
                    <p className="text-sm text-text-secondary">Interrogate research papers and technical manuals to extract specific data points instantly.</p>
                 </div>
                 <div className="space-y-2">
                    <h4 className="font-bold">Operations & SOPs</h4>
                    <p className="text-sm text-text-secondary">Make internal knowledge accessible. Let teams ask "How do I..." across all company documents.</p>
                 </div>
                 <div className="space-y-2">
                    <h4 className="font-bold">Financial Analysis</h4>
                    <p className="text-sm text-text-secondary">Reason across reports and filings to identify trends and grounded financial insights.</p>
                 </div>
              </div>
           </div>
        </section>

        {/* Workflow Section */}
        <section id="workflow" className="mx-auto max-w-7xl px-6 py-24 bg-accent-glow rounded-[40px] mb-24 border border-accent/10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-8">How it works</h2>
              <div className="space-y-12">
                {WORKFLOW_STEPS.map((step, idx) => (
                  <div key={step.title} className="flex items-start gap-6 relative group">
                    {idx < WORKFLOW_STEPS.length - 1 && (
                      <div className="absolute top-10 left-5 w-0.5 h-12 bg-border/40 group-hover:bg-accent/40 transition-colors" />
                    )}
                    <div className="h-10 w-10 rounded-full border-2 border-accent flex items-center justify-center font-bold text-accent shrink-0 group-hover:bg-accent group-hover:text-white transition-all">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">{step.title}</h4>
                      <p className="text-text-secondary">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass rounded-3xl p-8 border border-border/40">
               <div className="flex items-center gap-4 mb-8">
                  <div className="h-12 w-12 bg-surface-raised rounded-xl border border-border flex items-center justify-center">
                     <Play size={20} className="text-accent ml-1" />
                  </div>
                  <div>
                    <div className="font-bold">Watch Demo</div>
                    <div className="text-sm text-text-secondary">2 min overview of DocuMind</div>
                  </div>
               </div>
               <div className="aspect-video bg-base rounded-xl border border-border relative overflow-hidden group cursor-pointer">
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                     <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center text-black shadow-2xl scale-90 group-hover:scale-100 transition-transform">
                        <Play size={32} fill="currentColor" />
                     </div>
                  </div>
                  <div className="p-8 space-y-4 opacity-40">
                    <div className="h-4 w-full bg-border/40 rounded-full" />
                    <div className="h-4 w-3/4 bg-border/40 rounded-full" />
                    <div className="h-4 w-5/6 bg-border/40 rounded-full" />
                  </div>
               </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 px-6">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="flex items-center gap-2 opacity-80">
              <BrainCircuit size={20} className="text-accent" />
              <span className="font-bold tracking-tight">DocuMind AI</span>
           </div>
           <p className="text-sm text-text-muted">© 2026 DocuMind AI. All rights reserved.</p>
           <div className="flex gap-6">
              <a href="#" className="text-sm text-text-muted hover:text-text-primary transition-colors">Privacy</a>
              <a href="#" className="text-sm text-text-muted hover:text-text-primary transition-colors">Terms</a>
              <a href="#" className="text-sm text-text-muted hover:text-text-primary transition-colors">Security</a>
           </div>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn">
          <div 
            className="absolute inset-0 bg-base/80 backdrop-blur-sm"
            onClick={() => setShowAuthModal(false)}
          />

          <div className="relative z-10 w-full max-w-md">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute -top-12 right-0 text-text-secondary hover:text-text-primary transition-colors p-2"
            >
              <X size={24} />
            </button>

            <Auth
              embedded
              initialMode={authMode}
              onSuccess={() => {
                setShowAuthModal(false);
                navigate('/dashboard', { replace: true });
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

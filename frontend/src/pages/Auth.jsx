import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { BrainCircuit, Mail, Lock, Loader2, AlertCircle, ArrowRight } from 'lucide-react';

export default function Auth({ embedded = false, initialMode = 'login', onSuccess }) {
  const [isLogin, setIsLogin] = useState(initialMode !== 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLogin(initialMode !== 'signup');
    setError(null);
    setSuccessMsg(null);
  }, [initialMode]);

  useEffect(() => {
    if (embedded) return;

    let active = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (active && session) {
        navigate('/dashboard', { replace: true });
      }
    });

    return () => {
      active = false;
    };
  }, [embedded, navigate]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (onSuccess) {
          onSuccess();
        } else {
          navigate('/dashboard', { replace: true });
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setSuccessMsg('Registration successful! Please check your email for verification.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const authCard = (
    <div className="w-full max-w-md bg-surface-raised/90 backdrop-blur-2xl border border-border p-8 rounded-2xl shadow-2xl relative z-10 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent/0 via-accent to-accent/0" />
      
      <div className="flex flex-col items-center mb-8">
        <div className="h-14 w-14 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/20 mb-6">
          <BrainCircuit className="text-white h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-text-primary tracking-tight text-center">
          {isLogin ? 'Welcome back' : 'Create an account'}
        </h2>
        <p className="text-text-secondary mt-2 text-sm text-center">
          {isLogin
            ? 'Enter your credentials to access your workspace'
            : 'Join DocuMind to start interrogating your documents'}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red/10 border border-red/20 rounded-lg flex items-start gap-3 animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-red shrink-0 mt-0.5" />
          <p className="text-sm text-red">{error}</p>
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-4 bg-green/10 border border-green/20 rounded-lg flex items-start gap-3 animate-fadeIn">
          <div className="w-5 h-5 text-green shrink-0 mt-0.5" />
          <p className="text-sm text-green">{successMsg}</p>
        </div>
      )}

      <form onSubmit={handleAuth} className="space-y-5">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-2 ml-1">Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Mail className="h-4 w-4 text-text-dim" />
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-11 pr-4 py-3 border border-border rounded-xl bg-base/50 text-text-primary placeholder-text-dim focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all text-sm"
              placeholder="name@company.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-2 ml-1">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-text-dim" />
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full pl-11 pr-4 py-3 border border-border rounded-xl bg-base/50 text-text-primary placeholder-text-dim focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all text-sm"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-accent hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent focus:ring-offset-base transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              {isLogin ? 'Sign In' : 'Create Account'}
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 text-center pt-6 border-t border-border/50">
        <button
          onClick={() => {
            setIsLogin(!isLogin);
            setError(null);
            setSuccessMsg(null);
          }}
          className="text-sm font-medium text-accent hover:text-accent-dim transition-colors"
        >
          {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  );

  if (embedded) {
    return authCard;
  }

  return (
    <div className="min-h-screen bg-base flex items-center justify-center p-4 selection:bg-accent/30 overflow-hidden relative">
      {/* Decorative blobs for full-page auth */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
      
      {authCard}
    </div>
  );
}

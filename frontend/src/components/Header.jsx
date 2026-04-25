import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="flex justify-between items-center h-14 px-4 w-full bg-base border-b border-border z-50">
      <div className="flex items-center gap-4">
        <div className="text-lg font-black tracking-tighter text-text-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-accent" style={{ fontVariationSettings: "'FILL' 1" }}>terminal</span>
          DocuMind AI
        </div>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-xl mx-4 relative hidden md:block">
        <div className="relative w-full border border-border bg-surface-raised h-8 flex items-center px-3 focus-within:border-accent transition-colors">
          <span className="material-symbols-outlined text-text-secondary text-[16px] mr-2">search</span>
          <input
            className="bg-transparent border-none outline-none w-full text-text-primary text-[14px] placeholder:text-border-subtle focus:ring-0 p-0 h-full"
            placeholder="Search workspace..."
            type="text"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        <div className="hidden lg:flex items-center gap-2 text-text-secondary text-[11px] font-bold tracking-[0.05em] border border-border px-2 py-1 bg-surface-raised">
          <span className="w-2 h-2 rounded-full bg-green" />
          System: Operational
        </div>
        <button className="text-text-muted hover:bg-surface-raised hover:text-accent transition-colors p-1.5">
          <span className="material-symbols-outlined text-[20px]">notifications</span>
        </button>
        <div className="flex items-center gap-2 ml-2 border-l border-border pl-4">
          <span className="text-text-secondary text-[12px] hidden sm:block">{user?.email}</span>
          <button 
            onClick={() => signOut()}
            className="text-text-muted hover:bg-surface-raised hover:text-red transition-colors p-1.5 flex items-center gap-1"
            title="Sign out"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}

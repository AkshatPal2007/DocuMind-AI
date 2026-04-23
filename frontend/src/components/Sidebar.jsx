import { Link, useLocation } from 'react-router-dom';
import { workspace } from '../api/client';

const NAV_ITEMS = [
  { to: '/', icon: 'folder_open', label: 'Sources' },
  { to: '/chat', icon: 'query_stats', label: 'Intelligence' },
  { to: '#', icon: 'precision_manufacturing', label: 'Activity' },
  { to: '#', icon: 'settings', label: 'Settings' },
];

export default function Sidebar({ onUploadClick }) {
  const location = useLocation();
  const docCount = workspace.getCount();

  return (
    <nav className="hidden md:flex flex-col w-[260px] h-full bg-surface-raised border-r border-border shrink-0">
      {/* Workspace Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-[11px] uppercase font-bold tracking-[0.05em] text-text-secondary mb-1">WORKSPACE</h2>
        <div className="text-[13px] font-medium tracking-[0.02em] text-text-primary">Deep-Space Node</div>
      </div>

      {/* Upload Button */}
      <div className="p-4">
        <button
          onClick={onUploadClick}
          className="w-full bg-accent text-white text-[11px] font-bold tracking-[0.05em] uppercase h-8 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">upload</span>
          UPLOAD DOCUMENT
        </button>
      </div>

      {/* Nav Items */}
      <div className="flex-1 overflow-y-auto py-2 flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            (item.to === '/' && location.pathname === '/') ||
            (item.to !== '/' && item.to !== '#' && location.pathname.startsWith(item.to));

          return (
            <Link
              key={item.label}
              to={item.to}
              className={`flex items-center gap-3 px-4 py-3 text-[11px] font-bold tracking-[0.05em] uppercase transition-all duration-150 border-l-2 ${
                isActive
                  ? 'text-accent bg-base border-accent'
                  : 'text-text-muted hover:text-text-primary hover:bg-base border-transparent'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Doc Count */}
      <div className="p-4 border-t border-border bg-base">
        <div className="flex justify-between items-center text-[13px] font-medium tracking-[0.02em] text-text-secondary">
          <span>Total Docs:</span>
          <span className="text-text-primary">{docCount}</span>
        </div>
      </div>

      {/* Footer Links */}
      <div className="border-t border-border py-2">
        <a href="#" className="flex items-center gap-3 px-4 py-2 text-text-muted hover:text-text-primary transition-colors text-[11px] font-bold tracking-[0.05em] uppercase">
          <span className="material-symbols-outlined text-[16px]">help_outline</span>
          Documentation
        </a>
        <a href="#" className="flex items-center gap-3 px-4 py-2 text-text-muted hover:text-text-primary transition-colors text-[11px] font-bold tracking-[0.05em] uppercase">
          <span className="material-symbols-outlined text-[16px]">api</span>
          Support
        </a>
      </div>
    </nav>
  );
}

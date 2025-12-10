import type { FC, SVGProps, JSX } from 'react';

interface NavItem {
  id: string;
  label: string;
  icon: (props: SVGProps<SVGSVGElement>) => JSX.Element;
  badge?: string;
  isActive?: boolean;
}

const navItems: NavItem[] = [
  { id: 'home', label: 'Home', icon: HomeIcon, isActive: true },
  { id: 'tasks', label: 'Tasks', icon: ListIcon },
  { id: 'messages', label: 'Messages', icon: ChatIcon, badge: '3' },
  { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

const Sidebar: FC = () => {
  return (
    <nav className="sidebar" aria-label="Main navigation">
      <div className="sidebar-inner">
        <div className="sidebar-logo">
          <div className="sidebar-logo-mark">TP</div>
          <div className="sidebar-logo-text">
            <span>Task Plaza</span>
            <p>Community marketplace</p>
          </div>
        </div>

        <div className="sidebar-nav" role="list">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`sidebar-nav-item ${item.isActive ? 'active' : ''}`}
              aria-current={item.isActive ? 'page' : undefined}
            >
              <item.icon className="sidebar-nav-icon" aria-hidden="true" />
              <span className="sidebar-nav-label">{item.label}</span>
              {item.badge && <span className="sidebar-nav-badge">{item.badge}</span>}
            </button>
          ))}
        </div>

        <div className="sidebar-footer">
          <button type="button" className="sidebar-cta">
            <span>Post task</span>
            <PlusIcon aria-hidden="true" />
          </button>

          <div className="sidebar-user">
            <div className="sidebar-avatar">J</div>
            <div>
              <p className="sidebar-user-name">Jordan Lee</p>
              <p className="sidebar-user-role">Organizer</p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;

function HomeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M3 11.5L12 4l9 7.5V21a1 1 0 0 1-1 1h-4v-5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v5H4a1 1 0 0 1-1-1v-9.5Z" />
    </svg>
  );
}

function ListIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M8 6h12M8 12h12M8 18h12M4 6h0.01M4 12h0.01M4 18h0.01" />
    </svg>
  );
}

function ChatIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M21 11.5a8.38 8.38 0 0 1-1.9 5.4 8.5 8.5 0 0 1-11 1.9L3 21l2.2-5.1a8.5 8.5 0 1 1 15.8-4.4Z" />
    </svg>
  );
}

function CalendarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function SettingsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 5 15.4a1.65 1.65 0 0 0-1.51-1H3.4a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 8.6 5a1.65 1.65 0 0 0 1-1.51V3.4a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19 8.6c0 .63.23 1.24.65 1.7a1.65 1.65 0 0 0 1.51 1h.09a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  );
}

function PlusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

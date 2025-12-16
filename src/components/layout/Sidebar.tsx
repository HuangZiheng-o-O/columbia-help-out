import type { FC, SVGProps, JSX } from 'react';
import { useUser, type AppUser } from '../../context/UserContext';

export type SidebarRoute = 'discover' | 'tasks';

interface NavItem {
  id: SidebarRoute;
  label: string;
  icon: (props: SVGProps<SVGSVGElement>) => JSX.Element;
  badge?: string;
}

interface SidebarProps {
  activeRoute: SidebarRoute;
  onNavigate?: (route: SidebarRoute) => void;
  onPostTask?: () => void;
  currentUser?: AppUser | null;
}

const navItems: NavItem[] = [
  { id: 'discover', label: 'Discover', icon: HomeIcon },
  { id: 'tasks', label: 'My tasks', icon: ListIcon },
];

const Sidebar: FC<SidebarProps> = ({ activeRoute, onNavigate, onPostTask, currentUser }) => {
  const { logout } = useUser();
  
  const handleLogout = () => {
    void logout();
  };
  
  const handleNavigate = (route: SidebarRoute) => {
    if (onNavigate) {
      onNavigate(route);
    }
  };

  const displayName = currentUser?.displayName ?? 'Guest';
  const avatarLetter = displayName.charAt(0).toUpperCase();
  const avatarColor = currentUser?.avatarColor ?? '#64748b';

  return (
    <nav className="sidebar" aria-label="Main navigation">
      <div className="sidebar-inner">
        <div className="sidebar-logo">
          <div className="sidebar-logo-mark">🦁</div>
          <div className="sidebar-logo-text">
            <span>Columbia</span>
            <p>Help Out</p>
          </div>
      </div>

        <div className="sidebar-nav" role="list">
          {navItems.map((item) => {
            const isActive = item.id === activeRoute;
            return (
        <button
                key={item.id}
          type="button"
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => handleNavigate(item.id)}
        >
                <item.icon className="sidebar-nav-icon" aria-hidden="true" />
                <span className="sidebar-nav-label">{item.label}</span>
                {item.badge && <span className="sidebar-nav-badge">{item.badge}</span>}
        </button>
            );
          })}
      </div>

        <div className="sidebar-footer">
          <button type="button" className="sidebar-cta" onClick={onPostTask}>
            <span>Post task</span>
            <PlusIcon aria-hidden="true" />
        </button>

          <div className="sidebar-user">
            <div className="sidebar-avatar" style={{ backgroundColor: avatarColor }}>
              {avatarLetter}
            </div>
            <div className="sidebar-user-info">
              <p className="sidebar-user-name">{displayName}</p>
              <button type="button" className="sidebar-logout-btn" onClick={handleLogout}>
                Sign out
              </button>
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

function PlusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

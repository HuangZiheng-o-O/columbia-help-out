import { useUser } from '../context/UserContext';

export default function Sidebar({ activeRoute, onNavigate, onPostTask }) {
  const { currentUser, logout } = useUser();

  const handleLogout = () => {
    logout();
  };

  const displayName = currentUser?.displayName || 'User';
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <nav className="sidebar">
      {/* Logo - Exact Figma Match */}
      <div className="sidebar-logo">
        <span className="sidebar-logo-icon">🦁</span>
        <div className="sidebar-logo-text">
          <span className="gold">Columbia</span>
          <br />
          Help Out
        </div>
      </div>

      {/* Divider */}
      <div className="sidebar-divider"></div>

      {/* Navigation */}
      <div className="sidebar-nav">
        <button
          className={`nav-item ${activeRoute === 'discover' ? 'active' : ''}`}
          onClick={() => onNavigate('discover')}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
          </svg>
          <span>Discover</span>
        </button>

        <button
          className={`nav-item ${activeRoute === 'mytasks' ? 'active' : ''}`}
          onClick={() => onNavigate('mytasks')}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
          </svg>
          <span>My Tasks</span>
        </button>

        <button
          className={`nav-item ${activeRoute === 'profile' ? 'active' : ''}`}
          onClick={() => onNavigate('profile')}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
          <span>Profile</span>
        </button>

        {/* Post Tasks Button */}
        <button className="nav-post-btn" onClick={onPostTask}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
          <span>Post Tasks</span>
        </button>
      </div>

      {/* User Footer */}
      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">{avatarLetter}</div>
          <div className="user-details">
            <p className="user-name">{displayName}</p>
            <button className="user-signout" onClick={handleLogout}>
              Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

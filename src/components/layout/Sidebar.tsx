import type { FC, SVGProps } from 'react';

const Sidebar: FC = () => {
  return (
    <nav
      className="sidebar"
      aria-label="Main navigation"
    >
      <div className="sidebar-icon active">
        <button
          type="button"
          className="sidebar-icon-button"
          aria-label="Home"
        >
          <HomeIcon aria-hidden="true" />
        </button>
      </div>

      <div className="sidebar-icon">
        <button
          type="button"
          className="sidebar-icon-button"
          aria-label="Task list"
        >
          <ListIcon aria-hidden="true" />
        </button>
      </div>

      <div className="sidebar-icon">
        <button
          type="button"
          className="sidebar-icon-button"
          aria-label="My tasks"
        >
          <UserIcon aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;

function HomeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      {...props}
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function ListIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      {...props}
    >
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <circle cx="4" cy="6" r="1" />
      <circle cx="4" cy="12" r="1" />
      <circle cx="4" cy="18" r="1" />
    </svg>
  );
}

function UserIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      {...props}
    >
      <path d="M20 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M7 15.13A4 4 0 0 0 4 19v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

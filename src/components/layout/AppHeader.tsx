import type { FC, ChangeEvent } from 'react';

interface AppHeaderProps {
  searchText: string;
  onSearchChange: (value: string) => void;
  onPostTask?: () => void;
}

const AppHeader: FC<AppHeaderProps> = ({
  searchText,
  onSearchChange,
  onPostTask,
}) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  return (
    <header className="header">
      <div className="logo" aria-label="Task Plaza home">
        Task Plaza
      </div>

      <div className="search-box">
        <label className="sr-only" htmlFor="task-search-input">
          Search tasks, places, or users
        </label>
        <span className="search-icon" aria-hidden="true">
          🔍
        </span>
        <input
          id="task-search-input"
          type="search"
          className="search-input"
          placeholder="Search tasks, places, or users"
          value={searchText}
          onChange={handleChange}
        />
      </div>

      <button
        type="button"
        className="btn-post"
        aria-label="Post a new task"
        onClick={onPostTask}
      >
        Post Task
      </button>
    </header>
  );
};

export default AppHeader;

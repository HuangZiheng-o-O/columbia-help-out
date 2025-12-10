import type { FC } from 'react';
import type { TaskSortBy } from '../../api/taskTypes';

interface SortBarProps {
  sortBy: TaskSortBy;
  onSortChange: (sortBy: TaskSortBy) => void;
}

const SortBar: FC<SortBarProps> = ({ sortBy, onSortChange }) => {
  return (
    <section
      className="sort-bar"
      aria-label="Task sorting and filters"
    >
      <div className="sort-label">
        <span aria-hidden="true">⏱</span>
        <span>Sort by:</span>
      </div>

      <div
        className="sort-options"
        role="tablist"
        aria-label="Sorting options"
      >
        <SortButton
          id="sort-newest"
          label="Newest"
          description="Show the latest tasks first"
          isActive={sortBy === 'newest'}
          onClick={() => onSortChange('newest')}
        />
        <SortButton
          id="sort-nearest"
          label="Nearest"
          description="Show tasks nearest to your location"
          isActive={sortBy === 'nearest'}
          onClick={() => onSortChange('nearest')}
        />
        <SortButton
          id="sort-credits"
          label="Credits high → low"
          description="Show tasks with more credits first"
          isActive={sortBy === 'credits_desc'}
          onClick={() => onSortChange('credits_desc')}
        />
      </div>
    </section>
  );
};

interface SortButtonProps {
  id: string;
  label: string;
  description: string;
  isActive: boolean;
  onClick: () => void;
}

const SortButton: FC<SortButtonProps> = ({
  id,
  label,
  description,
  isActive,
  onClick,
}) => {
  return (
    <button
      id={id}
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-pressed={isActive}
      className={`sort-btn ${isActive ? 'active' : ''}`}
      onClick={onClick}
      title={description}
    >
      {label}
    </button>
  );
};

export default SortBar;

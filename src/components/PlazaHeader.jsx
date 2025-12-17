export default function PlazaHeader({
  searchText,
  onSearchChange,
  sortBy,
  onSortChange,
  onPostTask,
  onSearch,
}) {
  // Sort options matching Figma exactly
  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'nearest', label: 'Nearest' },
    { value: 'urgency', label: 'Urgency' },
    { value: 'credits_desc', label: 'Credit: High → Low' },
  ];

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSearch?.();
    }
  };

  return (
    <header className="plaza-header">
      {/* Top Row: Title, Search, Buttons */}
      <div className="plaza-header-top">
        <h1 className="plaza-title">Task Plaza</h1>
        
        <div className="search-box">
          <input
            type="text"
            className="search-input"
            placeholder="Enter keywords to search"
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className="header-actions">
          <button className="btn-search" onClick={onSearch}>
            Search
          </button>
          <button className="btn-post" onClick={onPostTask}>
            Post Task
          </button>
        </div>
      </div>

      {/* Sort Bar */}
      <div className="sort-bar">
        <span className="sort-label">Sort by:</span>
        {sortOptions.map((option) => (
          <button
            key={option.value}
            className={`sort-btn ${sortBy === option.value ? 'active' : ''}`}
            onClick={() => onSortChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </header>
  );
}

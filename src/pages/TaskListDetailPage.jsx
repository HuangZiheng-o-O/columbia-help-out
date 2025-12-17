export default function TaskListDetailPage({ task, onBack }) {
  if (!task) return null;

  const {
    title,
    category,
    credits,
    durationMinutes,
    location,
    shortDescription,
    createdAt,
    publisherName,
    claimerName,
  } = task;

  // Format posted time
  const formatPostedTime = (dateStr) => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Posted recently';
    
    const diffMs = Date.now() - date.getTime();
    const diffMin = Math.round(diffMs / 60000);
    
    if (diffMin < 1) return 'Posted just now';
    if (diffMin < 60) return `Posted ${diffMin} mins ago`;
    
    const diffHours = Math.round(diffMin / 60);
    if (diffHours < 24) return `Posted ${diffHours} hrs ago`;
    
    const diffDays = Math.round(diffHours / 24);
    return `Posted ${diffDays} days ago`;
  };

  // Category label
  const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <div className="task-list-detail-page">
      <div className="task-list-detail-container">
        {/* Back Button */}
        <button className="detail-back-btn" onClick={onBack}>
          ← Back to Task List
        </button>

        {/* Header */}
        <div className="detail-header">
          <h1 className="detail-title">{title}</h1>
          <span className={`detail-category ${category}`}>{categoryLabel}</span>
        </div>

        {/* Posted Time */}
        <p className="detail-posted">{formatPostedTime(createdAt)}</p>

        {/* Credits & Time Box */}
        <div className="detail-stats-box">
          <div className="detail-stat">
            <span className="detail-stat-label">CREDITS</span>
            <div className="detail-stat-value">
              <span className="detail-stat-number">{credits}</span>
              <span className="detail-stat-unit">credits</span>
            </div>
          </div>
          <div className="detail-stat-divider"></div>
          <div className="detail-stat">
            <span className="detail-stat-label">EST. TIME</span>
            <div className="detail-stat-value">
              <span className="detail-stat-number">{durationMinutes}</span>
              <span className="detail-stat-unit">mins</span>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="detail-section with-divider">
          <h3 className="detail-section-title with-bar">Location</h3>
          <div className="detail-location-box">
            <span className="detail-location-icon">◎</span>
            <span>{location}</span>
          </div>
        </div>

        {/* Task Details */}
        <div className="detail-section with-divider">
          <h3 className="detail-section-title with-bar">Task Details</h3>
          <div className="detail-description-box">
            <p className="detail-description">
              {shortDescription || 'No description provided.'}
            </p>
          </div>
        </div>

        {/* Publisher Reputation */}
        <div className="detail-section with-divider">
          <h3 className="detail-section-title with-bar">Publisher Reputation</h3>
          <div className="detail-reputation-box">
            <div className="reputation-stat">
              <span className="reputation-label">Tasks completed</span>
              <span className="reputation-value">23</span>
            </div>
            <div className="reputation-stat">
              <span className="reputation-label">Cancellation rate</span>
              <span className="reputation-value">5%</span>
            </div>
          </div>
        </div>

        {/* Published by / Claimed by */}
        <div className="detail-section">
          <div className="detail-user-info">
            <p className="user-info-line">
              <span className="user-info-label">Published by:</span>
              <span className="user-info-name">{publisherName || 'Unknown'}</span>
            </p>
            <p className="user-info-line">
              <span className="user-info-label">Claimed by:</span>
              <span className="user-info-name">{claimerName || 'Not yet claimed'}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


import { useState } from 'react';
import { useUser } from '../context/UserContext';
import { taskService } from '../api/taskService';

export default function TaskCard({ task, onViewDetails }) {
  const { currentUser } = useUser();
  const [isClaiming, setIsClaiming] = useState(false);

  const {
    id,
    title,
    category,
    credits,
    location,
    durationMinutes,
    createdAt,
    createdByUid,
    claimedByUid,
  } = task;

  // Format posted time - Exact Figma format "Posted XX min ago"
  const formatPostedTime = (dateStr) => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Posted recently';
    
    const diffMs = Date.now() - date.getTime();
    const diffMin = Math.round(diffMs / 60000);
    
    if (diffMin < 1) return 'Posted just now';
    if (diffMin < 60) return `Posted ${diffMin} min ago`;
    
    const diffHours = Math.round(diffMin / 60);
    if (diffHours < 24) return `Posted ${diffHours} hours ago`;
    
    const diffDays = Math.round(diffHours / 24);
    return `Posted ${diffDays} days ago`;
  };

  // Check if user can claim
  const isOwnTask = currentUser?.uid === createdByUid;
  const isAlreadyClaimed = claimedByUid !== null;
  const canClaim = !isOwnTask && !isAlreadyClaimed;

  const handleClaim = async () => {
    if (!currentUser || !canClaim) return;

    try {
      setIsClaiming(true);
      await taskService.updateTaskStatus({
        taskId: id,
        status: 'claimed',
        claimedByUid: currentUser.uid,
        claimerEmail: currentUser.email,
        claimerName: currentUser.displayName || 'User',
      });
      alert('Task claimed successfully! Check "My Tasks" to view it.');
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert('Failed to claim task. Please try again.');
    } finally {
      setIsClaiming(false);
    }
  };

  // Category label with first letter capitalized
  const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <article className="task-card">
      {/* Blue content area */}
      <div className="task-card-content">
        {/* Title */}
        <h3 className="task-card-title">{title}</h3>
        
        {/* Category Badge */}
        <span className={`task-category ${category}`}>
          {categoryLabel}
        </span>

        {/* Meta: Location & Duration */}
        <div className="task-meta">
          <div className="task-meta-item">
            <span className="task-meta-icon">◎</span>
            <span>{location}</span>
          </div>
          <div className="task-meta-item">
            <span className="task-meta-icon">◷</span>
            <span>{durationMinutes} min needed</span>
          </div>
        </div>

        {/* Posted Time */}
        <p className="task-posted">{formatPostedTime(createdAt)}</p>
      </div>

      {/* Footer: White area with Credits + Actions */}
      <div className="task-footer">
        <div className="task-credits">
          {credits} <span>Credits</span>
        </div>
        <div className="task-actions">
          <button className="btn-details" onClick={() => onViewDetails(task)}>
            Details
          </button>
          <button
            className="btn-claim"
            onClick={handleClaim}
            disabled={!canClaim || isClaiming}
          >
            Claim
          </button>
        </div>
      </div>
    </article>
  );
}

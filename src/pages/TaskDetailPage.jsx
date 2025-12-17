import { useState } from 'react';
import { useUser } from '../context/UserContext';
import { taskService } from '../api/taskService';

export default function TaskDetailPage({ task, onBack, onClaimed }) {
  const { currentUser } = useUser();
  const [isClaiming, setIsClaiming] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!task) return null;

  const {
    id,
    title,
    category,
    credits,
    durationMinutes,
    location,
    shortDescription,
    createdAt,
    createdByUid,
    publisherEmail,
    claimedByUid,
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

  // Check permissions
  const isOwnTask = currentUser?.uid === createdByUid;
  const isAlreadyClaimed = claimedByUid !== null;
  const canClaim = !isOwnTask && !isAlreadyClaimed;

  // Handle claim
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
      alert('Task claimed successfully!');
      onClaimed?.();
    } catch (error) {
      console.error(error);
      alert('Failed to claim task. Please try again.');
    } finally {
      setIsClaiming(false);
    }
  };

  // Handle copy email
  const handleCopyEmail = async () => {
    const email = publisherEmail || 'unknown@columbia.edu';
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert(`Email: ${email}`);
    }
  };

  // Category label
  const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <div className="task-detail-page">
      <div className="task-detail-container">
        {/* Back Button */}
        <button className="detail-back-btn" onClick={onBack}>
          ← Back to Task Plaza
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
        <div className="detail-section">
          <h3 className="detail-section-title with-bar">Location</h3>
          <div className="detail-location-box">
            <span className="detail-location-icon">◎</span>
            <span>{location}</span>
          </div>
        </div>

        {/* Task Details */}
        <div className="detail-section">
          <h3 className="detail-section-title with-bar">Task Details</h3>
          <div className="detail-description-box">
            <p className="detail-description">
              {shortDescription || 'No description provided.'}
            </p>
          </div>
        </div>

        {/* Publisher Reputation */}
        <div className="detail-section">
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

        {/* Warning */}
        <div className="detail-warning">
          <span className="warning-icon">⚠</span>
          <span>For in-person meetings, meet in public places; do not exchange valuables.</span>
        </div>

        {/* Action Buttons */}
        <div className="detail-actions">
          <button className="btn-copy-email" onClick={handleCopyEmail}>
            {copied ? 'Copied!' : 'Copy Email'}
          </button>
          <button
            className="btn-claim-now"
            onClick={handleClaim}
            disabled={!canClaim || isClaiming}
          >
            {isClaiming ? 'Claiming...' : 'Claim Now'}
          </button>
        </div>
      </div>
    </div>
  );
}


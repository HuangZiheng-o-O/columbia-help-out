import type { FC, SVGProps } from 'react';
import { useState } from 'react';
import type { Task } from '../../api/taskTypes';
import { copyTextToClipboard } from '../../utils/clipboard';
import { taskService } from '../../api/taskService';

interface TaskCardProps {
  task: Task;
  onSelectTask?: (task: Task) => void;
}

const TaskCard: FC<TaskCardProps> = ({ task, onSelectTask }) => {
  const {
    title,
    category,
    credits,
    location,
    durationMinutes,
    createdAt,
    isVerified,
    urgency,
    // isOnline,
    tags,
  } = task;

  const createdLabel = formatCreatedAt(createdAt);
  const [copied, setCopied] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  const handleCopyEmail = async () => {
    const fallback = task.publisherEmail ?? `${task.createdByUid}@columbia.edu`;
    const ok = await copyTextToClipboard(fallback);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClaim = async () => {
    try {
      setIsClaiming(true);
      await taskService.updateTaskStatus({
        taskId: task.id,
        status: 'claimed',
        claimedByUid: 'mock-user-1',
      });
      alert('Claimed successfully.');
    } catch (error) {
      console.error(error);
      alert('Failed to claim. Please try again.');
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <article className="task-card">
      <header className="task-card-header">
        <h3 className="task-title">{title}</h3>
      </header>

      <div className="task-meta">
        <span className={`task-tag ${category}`}>{category}</span>

        {urgency === 'urgent' && (
          <span className="task-tag urgent">
            <span aria-hidden="true">⚡</span> Urgent
          </span>
        )}
        {urgency === 'flexible' && (
          <span className="task-tag flexible">
            <span aria-hidden="true">🕐</span> Flexible
          </span>
        )}
        {urgency === 'normal' && (
          <span className="task-tag normal">Normal</span>
        )}

        {isVerified && (
          <span className="task-tag verified">
            <span className="sr-only">Email verified task</span>
            <VerifiedIcon aria-hidden="true" /> Verified
          </span>
        )}

        {/*{isOnline && (*/}
        {/*  <span className="task-tag online">*/}
        {/*    <span aria-hidden="true">🌐</span> Online*/}
        {/*  </span>*/}
        {/*)}*/}
      </div>

      <div className="task-credits" aria-label={`${credits} credits reward`}>
        {credits} <span>credits</span>
      </div>

      <dl className="task-details">
        <div className="task-details-item">
          <dt className="sr-only">Location</dt>
          <dd>
            <span className="task-details-icon" aria-hidden="true">
              📍
            </span>
            <span>{location}</span>
          </dd>
        </div>
        <div className="task-details-item">
          <dt className="sr-only">Estimated duration</dt>
          <dd>
            <span className="task-details-icon" aria-hidden="true">
              ⏱️
            </span>
            <span>~{durationMinutes} min needed</span>
          </dd>
        </div>
        <div className="task-details-item">
          <dt className="sr-only">Posted time</dt>
          <dd>
            <span className="task-details-icon" aria-hidden="true">
              🕐
            </span>
            <span>{createdLabel}</span>
          </dd>
        </div>
      </dl>

      {tags && tags.length > 0 && (
        <div className="task-tags-row" aria-label="Task tags">
          {tags.map((tag) => (
            <span key={tag} className="task-tag-chip">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="task-actions task-actions-split">
        <div className="task-action-col task-action-left">
          {onSelectTask && (
            <button
              type="button"
              className="task-action-btn task-action-secondary"
              onClick={() => onSelectTask(task)}
            >
              View details
            </button>
          )}
        </div>
        <div className="task-action-col task-action-center">
          <div className="task-action-with-toast">
            <button
              type="button"
              className="task-action-btn task-action-ghost"
              onClick={handleCopyEmail}
            >
              Copy Email
            </button>
            {copied && (
              <div className="copy-toast show" role="status">
                Email copied
              </div>
            )}
          </div>
        </div>
        <div className="task-action-col task-action-right">
          <button
            type="button"
            className="task-action-btn task-action-primary"
            disabled={isClaiming}
            onClick={handleClaim}
          >
            Claim now
          </button>
        </div>
      </div>
    </article>
  );
};

export default TaskCard;

function VerifiedIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      aria-hidden="true"
      {...props}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function formatCreatedAt(createdAt: string): string {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return 'Posted time unknown';

  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.round(diffMs / 60000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin} min ago`;

  const diffHours = Math.round(diffMin / 60);
  if (diffHours < 24) return `${diffHours} hours ago`;

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays} days ago`;
}

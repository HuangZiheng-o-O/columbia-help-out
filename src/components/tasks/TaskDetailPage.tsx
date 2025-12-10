import type { FC } from 'react';
import type { Task } from '../../api/taskTypes';

interface TaskDetailPageProps {
  task: Task;
  onBack: () => void;
  onViewSettlement: () => void;
}

const TaskDetailPage: FC<TaskDetailPageProps> = ({
  task,
  onBack,
  onViewSettlement,
}) => {
  const postedLabel = formatPostedLabel(task.createdAt);

  return (
    <main id="main-content" className="task-detail-page" role="main">
      <article className="task-detail-card" aria-describedby="task-meta-description">
        <header className="task-detail-header">
          <div className="task-detail-header-main">
            <button
              type="button"
              className="task-detail-back-btn"
              onClick={onBack}
              aria-label="Back to task list"
            >
              <span aria-hidden="true">←</span>
              <span className="task-detail-back-text">Back to tasks</span>
            </button>
            <h1 id="task-detail-heading" className="task-detail-title">
              {task.title}
            </h1>
            <p className="task-detail-posted-time" id="task-meta-description">
              Posted {postedLabel}
            </p>
          </div>

          <div className="task-detail-header-meta" aria-label="Task quick summary">
            <div className="task-meta-block">
              <dt className="task-meta-label">Credits</dt>
              <dd className="task-meta-value">
                <span className="task-meta-strong">{task.credits}</span>
                <span className="task-meta-unit">credits</span>
              </dd>
            </div>
            <div className="task-meta-divider" aria-hidden="true"></div>
            <div className="task-meta-block">
              <dt className="task-meta-label">Est. Time</dt>
              <dd className="task-meta-value">
                <span className="task-meta-strong">{task.durationMinutes}</span>
                <span className="task-meta-unit">mins</span>
              </dd>
            </div>
          </div>
        </header>

        <section
          className="task-detail-section task-detail-section--location"
          aria-labelledby="task-location-heading"
        >
          <div className="task-section-label">
            <span className="task-section-label-indicator" aria-hidden="true"></span>
            <h2 id="task-location-heading" className="task-section-title">
              Location
            </h2>
          </div>
          <p className="task-location-text">
            <span className="task-location-icon" aria-hidden="true">
              📍
            </span>
            <span>{task.location}</span>
          </p>
        </section>

        <section className="task-detail-section" aria-labelledby="task-details-heading">
          <h2 id="task-details-heading" className="task-section-title">
            Task Details
          </h2>
          <ul className="task-detail-list">
            <li>{task.shortDescription ?? 'No additional description yet.'}</li>
            <li>Category: {task.category}</li>
            {task.isOnline && <li>This task can be completed online.</li>}
            {task.urgency && <li>Urgency: {task.urgency}</li>}
          </ul>
        </section>

        <section
          className="task-detail-section"
          aria-labelledby="publisher-reputation-heading"
        >
          <h2 id="publisher-reputation-heading" className="task-section-title">
            Publisher Reputation
          </h2>
          <dl className="publisher-metrics">
            <div className="publisher-metric">
              <dt>Tasks completed</dt>
              <dd>23</dd>
            </div>
            <div className="publisher-metric">
              <dt>Cancellation rate</dt>
              <dd>5%</dd>
            </div>
            <div className="publisher-metric">
              <dt>Verification</dt>
              <dd>
                <span className="publisher-tag-verified">
                  <span className="publisher-tag-dot" aria-hidden="true"></span>
                  Campus email verified
                </span>
              </dd>
            </div>
          </dl>
        </section>

        <section className="task-detail-section task-detail-section--safety">
          <div className="task-safety-banner" role="note" aria-label="Safety tips">
            <span className="task-safety-icon" aria-hidden="true">
              ⚠️
            </span>
            <p className="task-safety-text">
              For in-person meetings, meet in public places; do not exchange valuables.
            </p>
          </div>
        </section>

        <footer className="task-detail-footer">
          <button type="button" className="btn-action btn-ask">
            Ask First
          </button>
          <button type="button" className="btn-action btn-claim">
            Claim Now
          </button>
          <button type="button" className="btn-action btn-view" onClick={onViewSettlement}>
            View settlement preview
          </button>
        </footer>
      </article>
    </main>
  );
};

export default TaskDetailPage;

function formatPostedLabel(createdAt: string): string {
  const label = new Date(createdAt);
  if (Number.isNaN(label.getTime())) {
    return 'moments ago';
  }
  const diffMinutes = Math.round((Date.now() - label.getTime()) / 60000);
  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes} mins ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hrs ago`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays} days ago`;
}


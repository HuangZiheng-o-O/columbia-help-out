import { useEffect, useState, type FC } from 'react';
import type { Task } from '../../api/taskTypes';

interface TaskSettlementPageProps {
  task: Task;
  onBack: () => void;
}

const TaskSettlementPage: FC<TaskSettlementPageProps> = ({ task, onBack }) => {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const handleCopyEmail = async () => {
    const fallback = task.publisherEmail ?? `${task.createdByUid}@columbia.edu`;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(fallback);
      }
    } catch (error) {
      console.warn('Clipboard copy failed', error);
    }
    setCopied(true);
  };

  return (
    <article className="task-detail-card" aria-describedby="task-settlement-description">
        <header className="task-detail-header">
          <div className="task-detail-header-main">
            <button
              type="button"
              className="task-detail-back-btn"
              aria-label="Back to task list"
              onClick={onBack}
            >
              <span aria-hidden="true">←</span>
              <span className="task-detail-back-text">Back to tasks</span>
            </button>

            <h1 id="task-detail-heading" className="task-detail-title">
              {task.title}
            </h1>

            <p className="task-settlement-status" id="task-settlement-description">
              Unsettled
            </p>
          </div>

          <div className="task-detail-header-right">
            <span className="task-campus-badge">Campus</span>
            <div className="task-detail-header-meta" aria-label="Task quick summary">
              <div className="task-meta-block">
                <span className="task-meta-label">Credits</span>
                <span className="task-meta-value">
                  <span className="task-meta-strong">{task.credits}</span>
                  <span className="task-meta-unit">credits</span>
                </span>
              </div>
              <div className="task-meta-divider" aria-hidden="true"></div>
              <div className="task-meta-block">
                <span className="task-meta-label">Est. Time</span>
                <span className="task-meta-value">
                  <span className="task-meta-strong">{task.durationMinutes}</span>
                  <span className="task-meta-unit">mins</span>
                </span>
              </div>
            </div>
          </div>
        </header>

        <hr className="task-detail-separator" aria-hidden="true" />

        <section
          className="task-detail-section task-detail-section--location"
          aria-labelledby="settlement-location-heading"
        >
          <div className="task-section-label">
            <span className="task-section-label-indicator" aria-hidden="true"></span>
            <h2 id="settlement-location-heading" className="task-section-title">
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

        <section className="task-detail-section" aria-labelledby="settlement-details-heading">
          <h2 id="settlement-details-heading" className="task-section-title">
            Task Details
          </h2>
          <ul className="task-detail-list">
            <li>{task.shortDescription ?? 'Publisher has not added a full description yet.'}</li>
            <li>Ensure settlement happens before the agreed deadline.</li>
            <li>Reach out to publisher if more information is required.</li>
          </ul>
        </section>

        <hr className="task-detail-separator" aria-hidden="true" />

        <section className="task-detail-section task-people-section" aria-labelledby="task-people-heading">
          <h2 id="task-people-heading" className="visually-hidden">
            People related to this task
          </h2>
          <dl className="task-people-info">
            <div className="task-people-row">
              <dt>Published by</dt>
              <dd>Andy Zhang</dd>
            </div>
            <div className="task-people-row">
              <dt>Claimed by</dt>
              <dd>Jack M</dd>
            </div>
          </dl>
        </section>
        <footer className="task-detail-footer">
          <button type="button" className="btn-action btn-ask" onClick={handleCopyEmail}>
            Ask First
          </button>
          <button type="button" className="btn-action btn-claim">
            Mark as Done
          </button>
          {copied && (
            <div className="copy-toast" role="status">
              Publisher email copied
            </div>
          )}
        </footer>
      </article>
  );
};

export default TaskSettlementPage;


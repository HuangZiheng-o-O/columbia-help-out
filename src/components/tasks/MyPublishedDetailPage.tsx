import { useState, type FC } from 'react';
import type { Task, TaskStatus } from '../../api/taskTypes';
import { taskService } from '../../api/taskService';

interface MyPublishedDetailPageProps {
  task: Task;
  onBack: () => void;
  currentUid?: string;
}

const MyPublishedDetailPage: FC<MyPublishedDetailPageProps> = ({
  task,
  onBack,
  currentUid = 'mock-user-1',
}) => {
  const postedLabel = formatPostedLabel(task.createdAt);
  const detailItems = buildDetailList(task);
  const [isActioning, setIsActioning] = useState(false);
  const isPublisher = task.createdByUid === currentUid;
  const disableWithdraw =
    task.status === 'cancelled' || task.status === 'completed' || (isPublisher && task.claimedByUid);
  const disableComplete = !isPublisher || (task.status !== 'open' && task.status !== 'claimed');

  const updateStatus = async (status: TaskStatus) => {
    try {
      setIsActioning(true);
      await taskService.updateTaskStatus({
        taskId: task.id,
        status,
        completedAt: status === 'completed' ? new Date().toISOString() : undefined,
      });
      onBack();
    } catch (error) {
      console.error(error);
      alert('Action failed. Please try again.');
    } finally {
      setIsActioning(false);
    }
  };

  return (
    <article className="task-detail-card" aria-describedby="task-meta-description">
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

          <p className="task-detail-posted-time" id="task-meta-description">
            Posted {postedLabel}
          </p>
        </div>

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
          {detailItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="task-detail-section task-people-section" aria-labelledby="task-people-heading">
        <h2 id="task-people-heading" className="visually-hidden">
          People related to this task
        </h2>
        <dl className="task-people-info">
          <div className="task-people-row">
            <dt>Published by</dt>
            <dd>You</dd>
          </div>
          <div className="task-people-row">
            <dt>Claimed by</dt>
            <dd>{task.claimedByUid ?? 'Not claimed yet'}</dd>
          </div>
        </dl>
      </section>

      <footer className="task-detail-footer">
        <button
          type="button"
          className="btn-row btn-row-success"
          disabled={disableComplete || isActioning}
          onClick={() => updateStatus('completed')}
        >
          Mark Completed
        </button>
        <button
          type="button"
          className="btn-row btn-row-warning"
          disabled={disableWithdraw || isActioning}
          onClick={() => updateStatus('cancelled')}
        >
          Withdraw
        </button>
      </footer>
    </article>
  );
};

export default MyPublishedDetailPage;

function buildDetailList(task: Task): string[] {
  const details: string[] = [];
  details.push(task.shortDescription ?? 'No additional description provided yet.');
  details.push(`Category: ${task.category}`);
  if (task.isOnline) {
    details.push('This task can be completed online.');
  }
  if (task.urgency) {
    details.push(`Urgency level: ${task.urgency}`);
  }
  details.push(`Location: ${task.location}`);
  return details;
}

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


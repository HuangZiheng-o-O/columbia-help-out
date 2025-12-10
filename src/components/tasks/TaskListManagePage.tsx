import { useEffect, useMemo, useState } from 'react';
import type { Task, TaskStatus } from '../../api/taskTypes';
import { taskService } from '../../api/taskService';

type Action = 'mark-completed' | 'withdraw';
type TabKey = 'published' | 'claimed';

interface TaskListManagePageProps {
  onSelectTask?: (taskId: string, status: TaskStatus) => void;
}

const TaskListManagePage = ({ onSelectTask }: TaskListManagePageProps) => {
  const [activeTab, setActiveTab] = useState<TabKey>('published');
  const [publishedTasks, setPublishedTasks] = useState<Task[]>([]);
  const [claimedTasks, setClaimedTasks] = useState<Task[]>([]);
  const [loadingPublished, setLoadingPublished] = useState(false);
  const [loadingClaimed, setLoadingClaimed] = useState(false);
  const [errorPublished, setErrorPublished] = useState<string | null>(null);
  const [errorClaimed, setErrorClaimed] = useState<string | null>(null);

  const currentUserUid = 'mock-user-1';

  const summary = useMemo(
    () => ({
      published: publishedTasks.length,
      claimed: claimedTasks.length,
    }),
    [publishedTasks, claimedTasks],
  );

  useEffect(() => {
    void loadPublished();
    void loadClaimed();
  }, []);

  async function loadPublished() {
    try {
      setLoadingPublished(true);
      setErrorPublished(null);
      const res = await taskService.listTasks({ scope: 'published', ownerUid: currentUserUid });
      setPublishedTasks(res.tasks);
    } catch (error) {
      console.error(error);
      setErrorPublished('Failed to load your published tasks.');
    } finally {
      setLoadingPublished(false);
    }
  }

  async function loadClaimed() {
    try {
      setLoadingClaimed(true);
      setErrorClaimed(null);
      const res = await taskService.listTasks({ scope: 'claimed', claimedByUid: currentUserUid });
      setClaimedTasks(res.tasks);
    } catch (error) {
      console.error(error);
      setErrorClaimed('Failed to load your claimed tasks.');
    } finally {
      setLoadingClaimed(false);
    }
  }

  const handleAction = async (listType: TabKey, taskId: string, action: Action) => {
    const status: TaskStatus = action === 'mark-completed' ? 'completed' : 'cancelled';
    try {
      await taskService.updateTaskStatus({
        taskId,
        status,
        completedAt: status === 'completed' ? new Date().toISOString() : undefined,
      });
      if (listType === 'published') {
        await loadPublished();
      } else {
        await loadClaimed();
      }
    } catch (error) {
      console.error(error);
      // TODO: surface toast/error UI
    }
  };

  const tabLabels: Record<TabKey, string> = {
    published: 'My Published Tasks',
    claimed: 'My Claimed Tasks',
  };

  return (
    <div className="task-list-page">
      <section className="task-list-shell" role="region" aria-label="My tasks overview">
        <header className="task-list-header">
          <div className="task-list-header-main">
            <h1 id="task-list-heading" className="task-list-title">
              Task List
            </h1>
            <p className="task-list-subtitle">
              View and manage tasks you published or claimed. Use the buttons on the right to update status or withdraw.
            </p>
          </div>

          <div className="task-list-header-meta" aria-label="Task summary">
            <div className="task-list-meta-item">
              <span className="task-list-meta-label">Published</span>
              <span className="task-list-meta-value" id="summary-published-count">
                {summary.published}
              </span>
            </div>
            <div className="task-list-meta-divider" aria-hidden="true"></div>
            <div className="task-list-meta-item">
              <span className="task-list-meta-label">Claimed</span>
              <span className="task-list-meta-value" id="summary-claimed-count">
                {summary.claimed}
              </span>
            </div>
          </div>
        </header>

        <div className="task-list-tabs" role="tablist" aria-label="Task ownership filter">
          {(['published', 'claimed'] as TabKey[]).map((tab, index) => {
            const isActive = tab === activeTab;
            return (
              <button
                key={tab}
                id={`tab-${tab}`}
                className={`task-tab ${isActive ? 'task-tab--active' : ''}`}
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${tab}`}
                tabIndex={isActive ? 0 : -1}
                data-tab={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                onKeyDown={(event) => {
                  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
                  event.preventDefault();
                  const tabs: TabKey[] = ['published', 'claimed'];
                  const nextIndex =
                    (index + (event.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length;
                  setActiveTab(tabs[nextIndex]);
                }}
              >
                {tabLabels[tab]}
              </button>
            );
          })}
        </div>

        {(['published', 'claimed'] as TabKey[]).map((tab) => {
          const isActive = tab === activeTab;
          const list = tab === 'published' ? publishedTasks : claimedTasks;
          const isLoading = tab === 'published' ? loadingPublished : loadingClaimed;
          const errorText = tab === 'published' ? errorPublished : errorClaimed;
          const emptyState =
            tab === 'published'
              ? 'You have not published any tasks yet.'
              : 'You have not claimed any tasks yet.';

          return (
            <section
              key={tab}
              id={`panel-${tab}`}
              className="task-panel"
              role="tabpanel"
              aria-labelledby={`tab-${tab}`}
              hidden={!isActive}
            >
              <h2 className="visually-hidden">{tabLabels[tab]}</h2>

              {isLoading && (
                <p className="task-panel-empty" role="status">
                  Loading…
                </p>
              )}

              {errorText && (
                <p className="task-panel-empty" role="alert">
                  {errorText}
                </p>
              )}

              {!isLoading && !errorText && (
                <ul className="task-list-rows" role="list">
                  {list.map((task) => (
                    <TaskListRow
                      key={task.id}
                      task={task}
                      listType={tab}
                      onAction={handleAction}
                      onSelectTask={onSelectTask}
                    />
                  ))}
                </ul>
              )}

              {list.length === 0 && !isLoading && !errorText && (
                <p className="task-panel-empty" aria-live="polite">
                  {emptyState}
                </p>
              )}
            </section>
          );
        })}
      </section>
    </div>
  );
};

interface TaskListRowProps {
  task: Task;
  listType: TabKey;
  onAction: (listType: TabKey, taskId: string, action: Action) => void;
  onSelectTask?: (taskId: string, status: TaskStatus) => void;
}

const TaskListRow = ({ task, listType, onAction, onSelectTask }: TaskListRowProps) => {
  const statusUi = mapStatusToUi(task.status);
  const disableWithdraw = task.status === 'cancelled';
  const disableComplete = task.status !== 'open' && task.status !== 'claimed';
  const meta =
    listType === 'published'
      ? `Posted by you${task.claimedByUid ? ' · Claimed' : ''}`
      : 'You claimed this task';

  return (
    <li
      className="task-row"
      data-task-id={task.id}
      data-task-status={task.status}
    >
      <div className="task-row-main">
        <div className="task-row-title-line">
          <p className="task-row-title">{task.title}</p>
          <span className={`task-row-status ${statusUi.className}`}>{statusUi.label}</span>
        </div>
        <p className="task-row-meta">{meta}</p>
      </div>

      <div className="task-row-actions">
        <button
          type="button"
          className="btn-row btn-row-primary"
          onClick={() => onSelectTask?.(task.id, task.status)}
        >
          View details
        </button>
        <button
          type="button"
          className="btn-row btn-row-success"
          data-action="mark-completed"
          aria-label={`Mark task “${task.title}” as completed`}
          disabled={disableComplete}
          onClick={() => onAction(listType, task.id, 'mark-completed')}
        >
          Mark Completed
        </button>
        <button
          type="button"
          className="btn-row btn-row-warning"
          data-action="withdraw"
          aria-label={`Withdraw task “${task.title}”`}
          disabled={disableWithdraw}
          onClick={() => onAction(listType, task.id, 'withdraw')}
        >
          Withdraw
        </button>
      </div>
    </li>
  );
};

function mapStatusToUi(status: TaskStatus): { label: string; className: string } {
  switch (status) {
    case 'completed':
      return { label: 'Completed', className: 'task-status--completed' };
    case 'cancelled':
      return { label: 'Withdrawn', className: 'task-status--withdrawn' };
    case 'claimed':
      return { label: 'Claimed', className: 'task-status--unsettled' };
    case 'open':
    default:
      return { label: 'Open', className: 'task-status--unsettled' };
  }
}

export default TaskListManagePage;


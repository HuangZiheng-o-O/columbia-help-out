import { useMemo, useState } from 'react';

type TaskStatus = 'unsettled' | 'completed' | 'withdrawn';
type Action = 'mark-completed' | 'withdraw';
type TabKey = 'published' | 'claimed';

interface ManageTask {
  id: string;
  title: string;
  status: TaskStatus;
  meta: string;
  helpersInterested?: number;
}

const initialPublished: ManageTask[] = [
  {
    id: 'task_buy_lunch',
    title: 'Buy a Lunch',
    status: 'unsettled',
    meta: 'Posted by you · 2 helpers interested',
  },
  {
    id: 'task_pick_package',
    title: 'Help pick a package',
    status: 'completed',
    meta: 'Completed · Waiting for settlement',
  },
  {
    id: 'task_friend_referral',
    title: 'Friend referral bonus',
    status: 'withdrawn',
    meta: 'Withdrawn by you · No longer visible to helpers',
  },
];

const initialClaimed: ManageTask[] = [
  {
    id: 'task_buy_drink',
    title: 'Buy a drink',
    status: 'unsettled',
    meta: 'You claimed this task · Waiting for completion',
  },
];

interface TaskListManagePageProps {
  onSelectTask?: (taskId: string, status: TaskStatus) => void;
}

const TaskListManagePage = ({ onSelectTask }: TaskListManagePageProps) => {
  const [activeTab, setActiveTab] = useState<TabKey>('published');
  const [publishedTasks, setPublishedTasks] = useState(initialPublished);
  const [claimedTasks, setClaimedTasks] = useState(initialClaimed);

  const summary = useMemo(
    () => ({
      published: publishedTasks.length,
      claimed: claimedTasks.length,
    }),
    [publishedTasks, claimedTasks],
  );

  const handleAction = (listType: TabKey, taskId: string, action: Action) => {
    const updater =
      listType === 'published' ? setPublishedTasks : setClaimedTasks;

    updater((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status:
                action === 'mark-completed'
                  ? 'completed'
                  : action === 'withdraw'
                  ? 'withdrawn'
                  : task.status,
            }
          : task,
      ),
    );

    // TODO: Replace with Firebase call (update task status).
    console.log('handleTaskAction', { listType, taskId, action });
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

              {list.length === 0 && (
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
  task: ManageTask;
  listType: TabKey;
  onAction: (listType: TabKey, taskId: string, action: Action) => void;
  onSelectTask?: (taskId: string, status: TaskStatus) => void;
}

const TaskListRow = ({ task, listType, onAction, onSelectTask }: TaskListRowProps) => {
  const statusClass =
    task.status === 'unsettled'
      ? 'task-status--unsettled'
      : task.status === 'completed'
      ? 'task-status--completed'
      : 'task-status--withdrawn';

  const disableActions = task.status === 'withdrawn';

  return (
    <li
      className="task-row"
      data-task-id={task.id}
      data-task-status={task.status}
    >
      <div className="task-row-main">
        <div className="task-row-title-line">
          <p className="task-row-title">{task.title}</p>
          <span className={`task-row-status ${statusClass}`}>{capitalize(task.status)}</span>
        </div>
        <p className="task-row-meta">{task.meta}</p>
      </div>

      <div className="task-row-actions">
        <button
          type="button"
          className="btn-row-ghost"
          onClick={() => onSelectTask?.(task.id, task.status)}
        >
          View details
        </button>
        <button
          type="button"
          className="btn-row-primary"
          data-action="mark-completed"
          aria-label={`Mark task “${task.title}” as completed`}
          disabled={task.status !== 'unsettled'}
          onClick={() => onAction(listType, task.id, 'mark-completed')}
        >
          Mark Completed
        </button>
        <button
          type="button"
          className="btn-row-secondary"
          data-action="withdraw"
          aria-label={`Withdraw task “${task.title}”`}
          disabled={disableActions}
          onClick={() => onAction(listType, task.id, 'withdraw')}
        >
          Withdraw
        </button>
      </div>
    </li>
  );
};

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default TaskListManagePage;


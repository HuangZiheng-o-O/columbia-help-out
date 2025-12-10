import { useEffect, useState, type ReactNode } from 'react';
import './index.css';
import { taskService } from './api/taskService';
import type { Task, TaskSortBy, TaskStatus } from './api/taskTypes';
import Sidebar, { type SidebarRoute } from './components/layout/Sidebar';
import AppHeader from './components/layout/AppHeader';
import SortBar from './components/layout/SortBar';
import TaskGrid from './components/tasks/TaskGrid';
import CreateTaskPage from './components/tasks/CreateTaskPage';
import TaskDetailPage from './components/tasks/TaskDetailPage';
import TaskSettlementPage from './components/tasks/TaskSettlementPage';
import TaskListManagePage from './components/tasks/TaskListManagePage';

type AppView = 'list' | 'create' | 'detail' | 'settlement' | 'manage';
type ManageStatus = TaskStatus;

function App() {
  const [view, setView] = useState<AppView>('list');
  const [activeRoute, setActiveRoute] = useState<SidebarRoute>('discover');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState<TaskSortBy>('newest');

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        setIsLoading(true);
        setLoadError(null);
      const effectiveSort = sortBy === 'nearest' ? 'newest' : sortBy;
      const result = await taskService.listTasks({
        searchText,
        sortBy: effectiveSort,
        limit: 20,
      });
        if (isMounted) {
          setTasks(result.tasks);
        }
      } catch (error) {
        console.error(error);
        if (isMounted) {
          setLoadError('Failed to load tasks. Please try again.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [searchText, sortBy]);

  const handleSelectTask = (task: Task, nextView: AppView = 'detail') => {
    setSelectedTask(task);
    setView(nextView);
  };

  const handleBackToList = () => {
    setSelectedTask(null);
    setView('list');
  };

  const handleSelectTaskFromManage = (taskId: string, status: ManageStatus) => {
    const fallback = tasks[0];
    const target = tasks.find((t) => t.id === taskId) ?? fallback;
    if (!target) {
      return;
    }
    const destination: AppView = status === 'completed' ? 'settlement' : 'detail';
    handleSelectTask(target, destination);
  };

  useEffect(() => {
    if (view === 'manage') {
      setActiveRoute('tasks');
    } else {
      setActiveRoute('discover');
    }
  }, [view]);

  const handleSidebarNavigate = (route: SidebarRoute) => {
    if (route === 'discover') {
      handleBackToList();
      setView('list');
      return;
    }
    if (route === 'tasks') {
      setView('manage');
      return;
    }
    // Placeholder for other routes.
    alert(`Navigation for “${route}” is not implemented yet.`);
  };

  const renderShell = (
    content: ReactNode,
    options: {
      mainId?: string;
      mainClassName?: string;
      mainLabel?: string;
    } = {},
  ) => {
    const { mainId = 'main-content', mainClassName = 'main-content', mainLabel } = options;
    return (
      <>
        <a href={`#${mainId}`} className="skip-link">
          Skip to main content
        </a>
        <div className="app-shell app-container">
          <Sidebar
            activeRoute={activeRoute}
            onNavigate={handleSidebarNavigate}
            onPostTask={() => setView('create')}
          />
          <main id={mainId} className={mainClassName} aria-label={mainLabel ?? 'Task area'}>
            {content}
          </main>
        </div>
      </>
    );
  };

  if (view === 'create') {
    return (
      <>
        <a href="#create-task-title" className="skip-link">
          Skip to create task form
        </a>
        <div className="app-shell app-container">
          <Sidebar
            activeRoute={activeRoute}
            onNavigate={handleSidebarNavigate}
            onPostTask={() => setView('create')}
          />
          <CreateTaskPage onCancel={handleBackToList} onCreated={handleBackToList} />
        </div>
      </>
    );
  }

  if (view === 'detail' && selectedTask) {
    return renderShell(<TaskDetailPage task={selectedTask} onBack={handleBackToList} />, {
      mainClassName: 'task-detail-page',
      mainLabel: 'Task detail view',
    });
  }

  if (view === 'settlement' && selectedTask) {
    return renderShell(<TaskSettlementPage task={selectedTask} onBack={handleBackToList} />, {
      mainClassName: 'task-detail-page',
      mainLabel: 'Task settlement view',
    });
  }

  if (view === 'manage') {
    return renderShell(<TaskListManagePage onSelectTask={handleSelectTaskFromManage} />, {
      mainLabel: 'Task management',
    });
  }

  return renderShell(
    <>
      <AppHeader
        searchText={searchText}
        onSearchChange={setSearchText}
        onPostTask={() => setView('create')}
      />

      <SortBar sortBy={sortBy} onSortChange={setSortBy} />

      <section className="task-list" aria-live="polite" aria-busy={isLoading ? 'true' : 'false'}>
        {isLoading && (
          <p role="status" className="task-list-status">
            Loading tasks…
          </p>
        )}

        {loadError && (
          <p role="alert" className="task-list-error">
            {loadError}
          </p>
        )}

        {!isLoading && !loadError && (
          <TaskGrid tasks={tasks} emptyHint="No tasks found yet." onSelectTask={handleSelectTask} />
        )}
      </section>
    </>,
  );
}

export default App;

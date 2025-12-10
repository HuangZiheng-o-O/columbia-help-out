import { useEffect, useState, type ReactNode } from 'react';
import './index.css';
import { taskService } from './api/taskService';
import type { Task, TaskSortBy, TaskStatus } from './api/taskTypes';
import { geocodeLocation, haversineMeters, type LatLng, DEFAULT_COORD } from './utils/geocoder';
import Sidebar, { type SidebarRoute } from './components/layout/Sidebar';
import AppHeader from './components/layout/AppHeader';
import SortBar from './components/layout/SortBar';
import TaskGrid from './components/tasks/TaskGrid';
import CreateTaskPage from './components/tasks/CreateTaskPage';
import PlazaDetailPage from './components/tasks/PlazaDetailPage';
import MyPublishedDetailPage from './components/tasks/MyPublishedDetailPage';
import MyClaimedDetailPage from './components/tasks/MyClaimedDetailPage';
import TaskSettlementPage from './components/tasks/TaskSettlementPage';
import TaskListManagePage from './components/tasks/TaskListManagePage';

type AppView = 'list' | 'create' | 'detail' | 'settlement' | 'manage';
type ManageStatus = TaskStatus;
export type DetailSource = 'plaza' | 'published' | 'claimed';
const CURRENT_USER_UID = 'mock-user-1';
type ReturnTo = 'list' | 'manage';
function App() {
  const [view, setView] = useState<AppView>('list');
  const [activeRoute, setActiveRoute] = useState<SidebarRoute>('discover');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [detailSource, setDetailSource] = useState<DetailSource>('plaza');
  const [returnTo, setReturnTo] = useState<ReturnTo>('list');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState<TaskSortBy>('newest');
  const [userLocation, setUserLocation] = useState<LatLng>(DEFAULT_COORD);

  useEffect(() => {
    let isMounted = true;

    // Try to resolve user location; fallback to default
    if (navigator?.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (!isMounted) return;
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          if (!isMounted) return;
          setUserLocation(DEFAULT_COORD);
        },
        { enableHighAccuracy: false, timeout: 3000 },
      );
    }

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
        if (!isMounted) return;

        if (sortBy === 'nearest') {
          const sorted = await sortTasksByNearest(result.tasks, userLocation ?? DEFAULT_COORD);
          if (isMounted) setTasks(sorted);
        } else {
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

  const handleSelectTask = (
    task: Task,
    nextView: AppView = 'detail',
    source: DetailSource = 'plaza',
  ) => {
    setDetailSource(source);
    setReturnTo(source === 'plaza' ? 'list' : 'manage');
    setSelectedTask(task);
    setView(nextView);
  };

  const handleBackToList = () => {
    setSelectedTask(null);
    setDetailSource('plaza');
    setReturnTo('list');
    setView('list');
  };

  const handleSelectTaskFromManage = async (
    taskId: string,
    status: ManageStatus,
    source: DetailSource,
  ) => {
    try {
      let target = tasks.find((t) => t.id === taskId) ?? null;
      if (!target) {
        target = await taskService.getTaskById(taskId);
      }
      if (!target) return;
      const destination: AppView = status === 'completed' ? 'settlement' : 'detail';
      setDetailSource(source);
      setReturnTo('manage');
      handleSelectTask(target, destination, source);
    } catch (error) {
      console.error('Failed to load task for manage detail', error);
    }
  };

  useEffect(() => {
    if (view === 'manage' || returnTo === 'manage' || detailSource !== 'plaza') {
      setActiveRoute('tasks');
    } else {
      setActiveRoute('discover');
    }
  }, [view, detailSource, returnTo]);

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
    const backToManage = () => {
      setSelectedTask(null);
      setReturnTo('manage');
      setView('manage');
    };
    const backTo =
      detailSource !== 'plaza' || returnTo === 'manage' ? backToManage : handleBackToList;
    if (detailSource === 'plaza') {
      return renderShell(
        <PlazaDetailPage task={selectedTask} onBack={backTo} currentUid={CURRENT_USER_UID} />,
        { mainClassName: 'task-detail-page', mainLabel: 'Task detail view' },
      );
    }
    if (detailSource === 'published') {
      return renderShell(
        <MyPublishedDetailPage task={selectedTask} onBack={backTo} currentUid={CURRENT_USER_UID} />,
        { mainClassName: 'task-detail-page', mainLabel: 'My published task detail' },
      );
    }
    return renderShell(
      <MyClaimedDetailPage task={selectedTask} onBack={backTo} currentUid={CURRENT_USER_UID} />,
      { mainClassName: 'task-detail-page', mainLabel: 'My claimed task detail' },
    );
  }

  if (view === 'settlement' && selectedTask) {
    const backToManage = () => {
      setSelectedTask(null);
      setReturnTo('manage');
      setView('manage');
    };
    const backTo =
      detailSource !== 'plaza' || returnTo === 'manage' ? backToManage : handleBackToList;
    return renderShell(
      <TaskSettlementPage
        task={selectedTask}
        onBack={backTo}
        hideAskFirst
      />,
      { mainClassName: 'task-detail-page', mainLabel: 'Task settlement view' },
    );
  }

  if (view === 'manage') {
    return renderShell(
      <TaskListManagePage
        onSelectTask={(id, status, source) => handleSelectTaskFromManage(id, status, source)}
      />,
      {
      mainLabel: 'Task management',
      },
    );
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

async function sortTasksByNearest(tasks: Task[], origin: LatLng): Promise<Task[]> {
  const enriched = await Promise.all(
    tasks.map(async (task) => {
      if (task.isOnline) return { task, dist: Number.POSITIVE_INFINITY };
      // use offline/static geocoding for speed; fallback to default coord
      const coord = await geocodeLocation(task.location, DEFAULT_COORD, { online: false });
      const dist = haversineMeters(origin, coord);
      return { task, dist };
    }),
  );
  return enriched.sort((a, b) => a.dist - b.dist).map((t) => t.task);
}

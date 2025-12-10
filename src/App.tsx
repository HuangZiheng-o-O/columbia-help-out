import { useEffect, useState } from 'react';
import './index.css';
import { taskService } from './api/taskService';
import type { Task, TaskSortBy } from './api/taskTypes';
import Sidebar from './components/layout/Sidebar';
import AppHeader from './components/layout/AppHeader';
import SortBar from './components/layout/SortBar';
import TaskGrid from './components/tasks/TaskGrid';
import CreateTaskPage from './components/tasks/CreateTaskPage';

function App() {
  const [view, setView] = useState<'list' | 'create'>('list');
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
        const result = await taskService.listTasks({
          searchText,
          sortBy,
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

  return view === 'create' ? (
    <>
      <a href="#create-task-title" className="skip-link">
        Skip to create task form
      </a>

      <div className="app-shell app-container">
        <Sidebar />
        <CreateTaskPage
          onCancel={() => setView('list')}
          onCreated={() => setView('list')}
        />
      </div>
    </>
  ) : (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <div className="app-shell app-container">
        <Sidebar />

        <main
          id="main-content"
          className="main-content"
          aria-label="Task Plaza main content"
        >
          <AppHeader
            searchText={searchText}
            onSearchChange={setSearchText}
            onPostTask={() => setView('create')}
          />

          <SortBar sortBy={sortBy} onSortChange={setSortBy} />

          <section
            className="task-list"
            aria-live="polite"
            aria-busy={isLoading ? 'true' : 'false'}
          >
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
              <TaskGrid tasks={tasks} emptyHint="No tasks found yet." />
            )}
          </section>
        </main>
      </div>
    </>
  );
}

export default App;

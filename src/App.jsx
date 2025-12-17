import { useEffect, useState } from 'react';
import './styles/index.css';
import { useUser } from './context/UserContext';
import { taskService } from './api/taskService';
import LoginPage from './pages/LoginPage';
import TaskListPage from './pages/TaskListPage';
import PostTaskPage from './pages/PostTaskPage';
import ProfilePage from './pages/ProfilePage';
import TaskDetailPage from './pages/TaskDetailPage';
import Sidebar from './components/Sidebar';
import PlazaHeader from './components/PlazaHeader';
import TaskGrid from './components/TaskGrid';

export default function App() {
  const { currentUser, isLoggedIn, isLoading: isAuthLoading } = useUser();
  
  const [activeRoute, setActiveRoute] = useState('discover');
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedTask, setSelectedTask] = useState(null);

  // Load tasks (only open/unsettled tasks for Plaza)
  useEffect(() => {
    if (!isLoggedIn) return;

    const loadTasks = async () => {
      try {
        setIsLoading(true);
        const result = await taskService.listTasks({
          searchText,
          sortBy,
          status: 'open',  // Only show open tasks in Plaza
          limit: 50,
        });
        setTasks(result.tasks);
      } catch (error) {
        console.error('Failed to load tasks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTasks();
  }, [isLoggedIn, sortBy]);

  // Handle search (only open/unsettled tasks)
  const handleSearch = async () => {
    if (!isLoggedIn) return;

    try {
      setIsLoading(true);
      const result = await taskService.listTasks({
        searchText,
        sortBy,
        status: 'open',  // Only show open tasks in Plaza
        limit: 50,
      });
      setTasks(result.tasks);
    } catch (error) {
      console.error('Failed to search tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle navigation
  const handleNavigate = (route) => {
    setActiveRoute(route);
  };

  // Handle post task
  const handlePostTask = () => {
    setActiveRoute('posttask');
  };

  // Handle post task cancel
  const handlePostTaskCancel = () => {
    setActiveRoute('discover');
  };

  // Handle post task success
  const handlePostTaskSuccess = () => {
    setActiveRoute('discover');
    // Reload tasks
    window.location.reload();
  };

  // Handle view details
  const handleViewDetails = (task) => {
    setSelectedTask(task);
    setActiveRoute('taskDetail');
  };

  // Handle back from detail
  const handleBackFromDetail = () => {
    setSelectedTask(null);
    setActiveRoute('discover');
  };

  // Handle task claimed
  const handleTaskClaimed = () => {
    setSelectedTask(null);
    setActiveRoute('discover');
    // Reload tasks
    window.location.reload();
  };

  // Auth loading state
  if (isAuthLoading) {
    return (
      <div className="login-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!isLoggedIn || !currentUser) {
    return <LoginPage />;
  }

  // Render page content based on route
  const renderPageContent = () => {
    switch (activeRoute) {
      case 'mytasks':
        return <TaskListPage />;
      case 'profile':
        return <ProfilePage />;
      case 'posttask':
        return (
          <PostTaskPage
            onCancel={handlePostTaskCancel}
            onSuccess={handlePostTaskSuccess}
          />
        );
      case 'taskDetail':
        return (
          <TaskDetailPage
            task={selectedTask}
            onBack={handleBackFromDetail}
            onClaimed={handleTaskClaimed}
          />
        );
      case 'discover':
      default:
        return (
          <>
            <PlazaHeader
              searchText={searchText}
              onSearchChange={setSearchText}
              sortBy={sortBy}
              onSortChange={setSortBy}
              onPostTask={handlePostTask}
              onSearch={handleSearch}
            />
            <div className="task-grid-container">
              <TaskGrid
                tasks={tasks}
                isLoading={isLoading}
                onViewDetails={handleViewDetails}
              />
            </div>
          </>
        );
    }
  };

  // Main app
  return (
    <div className="app-layout">
      <Sidebar
        activeRoute={activeRoute}
        onNavigate={handleNavigate}
        onPostTask={handlePostTask}
      />
      
      <main className="main-content">
        {renderPageContent()}
      </main>
    </div>
  );
}


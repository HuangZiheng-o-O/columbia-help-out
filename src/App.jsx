import { useEffect, useState } from 'react';
import './styles/index.css';
import { useUser } from './context/UserContext';
import { taskService } from './api/taskService';
import LoginPage from './pages/LoginPage';
import Sidebar from './components/Sidebar';
import PlazaHeader from './components/PlazaHeader';
import TaskGrid from './components/TaskGrid';

export default function App() {
  const { currentUser, isLoggedIn, isLoading: isAuthLoading } = useUser();
  
  const [activeRoute, setActiveRoute] = useState('discover');
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState('nearest');

  // Load tasks
  useEffect(() => {
    if (!isLoggedIn) return;

    const loadTasks = async () => {
      try {
        setIsLoading(true);
        const result = await taskService.listTasks({
          searchText,
          sortBy: sortBy === 'nearest' ? 'newest' : sortBy,
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

  // Handle search
  const handleSearch = async () => {
    if (!isLoggedIn) return;

    try {
      setIsLoading(true);
      const result = await taskService.listTasks({
        searchText,
        sortBy: sortBy === 'nearest' ? 'newest' : sortBy,
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
    // TODO: Implement other routes
    if (route !== 'discover') {
      alert(`"${route}" page is coming soon!`);
    }
  };

  // Handle post task
  const handlePostTask = () => {
    alert('Post Task page is coming soon!');
  };

  // Handle view details
  const handleViewDetails = (task) => {
    alert(`Task Details:\n\n${task.title}\n\n${task.shortDescription || 'No description'}\n\nCredits: ${task.credits}\nLocation: ${task.location}`);
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

  // Main app
  return (
    <div className="app-layout">
      <Sidebar
        activeRoute={activeRoute}
        onNavigate={handleNavigate}
        onPostTask={handlePostTask}
      />
      
      <main className="main-content">
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
      </main>
    </div>
  );
}


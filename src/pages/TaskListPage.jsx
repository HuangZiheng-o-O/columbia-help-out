import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { taskService } from '../api/taskService';
import TaskListDetailPage from './TaskListDetailPage';

export default function TaskListPage() {
  const { currentUser } = useUser();
  const [activeTab, setActiveTab] = useState('published');
  const [publishedTasks, setPublishedTasks] = useState([]);
  const [claimedTasks, setClaimedTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Load tasks
  useEffect(() => {
    if (!currentUser) return;

    const loadTasks = async () => {
      try {
        setIsLoading(true);
        
        // Load published tasks (tasks created by current user)
        const publishedResult = await taskService.listTasks({
          scope: 'published',
          ownerUid: currentUser.uid,
          limit: 50,
        });
        setPublishedTasks(publishedResult.tasks);

        // Load claimed tasks (tasks claimed by current user)
        const claimedResult = await taskService.listTasks({
          scope: 'claimed',
          claimedByUid: currentUser.uid,
          limit: 50,
        });
        setClaimedTasks(claimedResult.tasks);
      } catch (error) {
        console.error('Failed to load tasks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTasks();
  }, [currentUser]);

  // Handle mark completed
  const handleMarkCompleted = async (taskId) => {
    try {
      await taskService.updateTaskStatus({
        taskId,
        status: 'completed',
      });
      // Refresh tasks
      window.location.reload();
    } catch (error) {
      console.error('Failed to mark completed:', error);
      alert('Failed to mark as completed');
    }
  };

  // Handle withdraw
  const handleWithdraw = async (taskId) => {
    if (!confirm('Are you sure you want to withdraw this task?')) return;
    
    try {
      await taskService.updateTaskStatus({
        taskId,
        status: 'cancelled',  // Use 'cancelled' for credit refund
        currentUserUid: currentUser.uid,
      });
      // Refresh tasks
      window.location.reload();
    } catch (error) {
      console.error('Failed to withdraw:', error);
      alert('Failed to withdraw task');
    }
  };

  // Get status label style
  const getStatusClass = (status) => {
    switch (status) {
      case 'open':
      case 'claimed':
        return 'status-unsettled';
      case 'cancelled':
        return 'status-withdrawn';
      case 'completed':
        return 'status-completed';
      default:
        return 'status-unsettled';
    }
  };

  // Get status label text
  const getStatusText = (status) => {
    switch (status) {
      case 'open':
      case 'claimed':
        return 'Unsettled';
      case 'cancelled':
        return 'Withdrawn';
      case 'completed':
        return 'Completed';
      default:
        return 'Unsettled';
    }
  };

  const currentTasks = activeTab === 'published' ? publishedTasks : claimedTasks;
  const publishedCount = publishedTasks.length;
  const claimedCount = claimedTasks.length;

  // Handle view details
  const handleViewDetails = (task) => {
    setSelectedTask(task);
  };

  // Handle back from detail
  const handleBackFromDetail = () => {
    setSelectedTask(null);
  };

  // If a task is selected, show detail page
  if (selectedTask) {
    return (
      <TaskListDetailPage
        task={selectedTask}
        onBack={handleBackFromDetail}
      />
    );
  }

  return (
    <div className="task-list-page">
      <div className="task-list-container">
        {/* Header */}
        <div className="task-list-header">
          <h1 className="task-list-title">Task List</h1>
          <p className="task-list-subtitle">
            View and manage tasks you published or claimed. Use the bottoms on the right to update status or withdraw.
          </p>
        </div>

      {/* Controls Row */}
      <div className="task-list-controls">
        {/* Tab Switcher */}
        <div className="task-list-tabs">
          <button
            className={`tab-btn ${activeTab === 'published' ? 'active' : ''}`}
            onClick={() => setActiveTab('published')}
          >
            My Published
          </button>
          <button
            className={`tab-btn ${activeTab === 'claimed' ? 'active' : ''}`}
            onClick={() => setActiveTab('claimed')}
          >
            My Claimed
          </button>
        </div>

        {/* Stats */}
        <div className="task-list-stats">
          <div className="stat-item">
            <span className="stat-label">PUBLISHED</span>
            <span className="stat-value">{publishedCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">CLAIMED</span>
            <span className="stat-value">{claimedCount}</span>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="task-list-items">
        {isLoading ? (
          <div className="loading-state">Loading...</div>
        ) : currentTasks.length === 0 ? (
          <div className="empty-state">
            No tasks found in this category.
          </div>
        ) : (
          currentTasks.map((task) => (
            <div key={task.id} className="task-list-item">
              <div className="task-list-item-info">
                <h3 className="task-list-item-title">{task.title}</h3>
                <span className={`task-status-badge ${getStatusClass(task.status)}`}>
                  {getStatusText(task.status)}
                </span>
              </div>
              <div className="task-list-item-actions">
                <button className="btn-task-details" onClick={() => handleViewDetails(task)}>Details</button>
                
                {/* My Published: Show Mark Completed, disabled if not claimed, hide if cancelled/completed */}
                {activeTab === 'published' && task.status !== 'cancelled' && task.status !== 'completed' && (
                  <button
                    className="btn-mark-completed"
                    onClick={() => handleMarkCompleted(task.id)}
                    disabled={task.status !== 'claimed'}
                  >
                    Marked Completed
                  </button>
                )}
                
                {/* Show Withdraw for unsettled tasks (open/claimed), not for cancelled/completed */}
                {task.status !== 'cancelled' && task.status !== 'completed' && (
                  <button
                    className="btn-withdraw"
                    onClick={() => handleWithdraw(task.id)}
                  >
                    Withdraw
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      </div>
    </div>
  );
}


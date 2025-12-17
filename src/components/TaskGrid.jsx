import TaskCard from './TaskCard';

export default function TaskGrid({ tasks, isLoading, onViewDetails }) {
  if (isLoading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📋</div>
        <h3>No tasks found</h3>
        <p>Try adjusting your search or post a new task!</p>
      </div>
    );
  }

  return (
    <div className="task-grid">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
}


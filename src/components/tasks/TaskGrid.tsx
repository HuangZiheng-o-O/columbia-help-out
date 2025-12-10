import type { FC } from 'react';
import type { Task } from '../../api/taskTypes';
import TaskCard from './TaskCard';

interface TaskGridProps {
  tasks: Task[];
  emptyHint?: string;
}

const TaskGrid: FC<TaskGridProps> = ({ tasks, emptyHint }) => {
  if (!tasks.length) {
    return (
      <p className="task-list-empty" role="status">
        {emptyHint ?? 'No tasks available right now.'}
      </p>
    );
  }

  return (
    <div className="task-grid">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
};

export default TaskGrid;

import React from 'react';
import { Task } from '../types';
import '../styles/TaskList.css';

interface TaskListProps {
    tasks: Task[];
    onSelectTask: (task: Task) => void;
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, onSelectTask }) => {
    if (tasks.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-icon">📝</div>
                <h3>No pending tasks</h3>
                <p>All caught up! Tasks will appear here when available.</p>
            </div>
        );
    }

    return (
        <div className="task-list">
            {tasks.map((task, index) => (
                <div 
                    key={task.id} 
                    className="task-card"
                    onClick={() => onSelectTask(task)}
                    style={{ animationDelay: `${index * 50}ms` }}
                >
                    <div className="task-header">
                        <span className="task-id">#{task.id.slice(-6)}</span>
                        <span className="task-time">
                            {new Date(task.created_at * 1000).toLocaleTimeString()}
                        </span>
                    </div>
                    <div className="task-content">
                        <p className="task-prompt">{task.prompt}</p>
                        <div className="task-meta">
                            <span className="task-url">🌐 {new URL(task.url).hostname}</span>
                        </div>
                    </div>
                    <div className="task-arrow">→</div>
                </div>
            ))}
        </div>
    );
};
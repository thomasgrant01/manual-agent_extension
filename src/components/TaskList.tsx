import React from 'react';
import { Task } from '../types';
import './TaskList.css';

interface TaskListProps {
    tasks: Task[];
    onSelectTask: (task: Task) => void;
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, onSelectTask }) => {
    return (
        <div className="task-list">
            <h3>Pending Tasks</h3>
            <ul>
                {tasks.map((task) => (
                    <li key={task.id} onClick={() => onSelectTask(task)}>
                        <div className="task-item">
                            <span className="task-id">{task.id}</span>
                            <span className="task-prompt">{task.prompt}</span>
                            <span className="task-time">
                                {new Date(task.created_at * 1000).toLocaleString()}
                            </span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};
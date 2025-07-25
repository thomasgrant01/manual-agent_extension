import React, { useState, useEffect } from 'react';
import { TaskList } from './components/TaskList';
import { TaskDetails } from './components/TaskDetails';
import { MousePosition } from './components/MousePosition';
import { useTasks } from './hooks/useTasks';
import './styles/App.css';
import { Task, TaskAction } from './types';

const App: React.FC = () => {
    const { tasks, loading, error, selectedTask, setSelectedTask, updateTask } = useTasks();

    const handleTaskSubmit = (actions: TaskAction[]) => {
        if (selectedTask) {
            updateTask(selectedTask.id, actions);
        }
    };

    const configureBrowserForTask = (task: Task) => {
        // Send message to content script to configure browser window
        window.postMessage({
            type: 'CONFIGURE_BROWSER',
            specifications: task.specifications,
            windowSize: {
                innerWidth: window.innerWidth,
                innerHeight: window.innerHeight,
                outerWidth: window.outerWidth,
                outerHeight: window.outerHeight
            }
        }, '*');
    };

    const handleTaskSelect = (task: any) => {
        setSelectedTask(task);
        
        // Configure browser according to task specifications
        configureBrowserForTask(task);
        
        // Only navigate if the host is different from current host
        if (task.url && task.url !== window.location.href) {
            try {
                const taskUrl = new URL(task.url);
                const currentUrl = new URL(window.location.href);
                
                // Only navigate if hosts are different
                if (taskUrl.host !== currentUrl.host) {
                    window.location.href = task.url;
                } else {
                    console.log('Same host, skipping navigation. Task URL:', taskUrl.host, 'Current URL:', currentUrl.host);
                }
            } catch (error) {
                console.error('Failed to parse URLs for navigation check:', error);
                // Fallback to original behavior if URL parsing fails
                window.location.href = task.url;
            }
        }
    };

    return (
        <div className="app-container">
            {error && (
                <div className="error-banner">
                    ⚠️ {error}
                </div>
            )}

            {!selectedTask ? (
                <div className="task-list-container">
                    <div className="header-section">
                        <span className="task-count">{tasks.length} tasks</span>
                        <span className="hotkey-hint">Alt+C to capture</span>
                    </div>
                    <TaskList tasks={tasks} onSelectTask={handleTaskSelect} />
                </div>
            ) : (
                <TaskDetails
                    task={selectedTask}
                    onClose={() => setSelectedTask(null)}
                    onSubmit={handleTaskSubmit}
                />
            )}
            
            <MousePosition />
        </div>
    );
};

export default App;
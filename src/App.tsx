import React from 'react';
import { MouseTracker } from './components/MouseTracker';
import { TaskList } from './components/TaskList';
import { TaskDetails } from './components/TaskDetails';
import { useTasks } from './hooks/useTasks';
import './styles/App.css';

const App: React.FC = () => {
    const { tasks, loading, error, selectedTask, setSelectedTask, updateTask } = useTasks();

    const handleTaskSubmit = (actions: TaskAction[]) => {
        if (selectedTask) {
            updateTask(selectedTask.id, actions);
        }
    };

    return (
        <div className="app-container">
            <MouseTracker />
            {loading && <div className="loading">Loading...</div>}
            {error && <div className="error">{error}</div>}
            {!selectedTask ? (
                <TaskList tasks={tasks} onSelectTask={setSelectedTask} />
            ) : (
                <TaskDetails
                    task={selectedTask}
                    onClose={() => setSelectedTask(null)}
                    onSubmit={handleTaskSubmit}
                />
            )}
        </div>
    );
};

export default App;
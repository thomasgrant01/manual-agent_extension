import React, { useState } from 'react';
import { Task, TaskAction } from '../types';
import './TaskDetails.css';

interface TaskDetailsProps {
    task: Task;
    onClose: () => void;
    onSubmit: (actions: TaskAction[]) => void;
}

export const TaskDetails: React.FC<TaskDetailsProps> = ({ task, onClose, onSubmit }) => {
    const [actions, setActions] = useState<TaskAction[]>([]);
    const [textInput, setTextInput] = useState('');

    const addClickAction = (x: number, y: number) => {
        setActions([...actions, { action: 'ClickAction', data: { x, y } }]);
    };

    const addDoubleClickAction = (x: number, y: number) => {
        setActions([...actions, { action: 'DoubleClickAction', data: { x, y } }]);
    };

    const addTypeAction = () => {
        if (textInput.trim()) {
            setActions([...actions, { action: 'TypeAction', data: textInput }]);
            setTextInput('');
        }
    };

    const addScrollAction = (y: number) => {
        setActions([...actions, { action: 'ScrollAction', data: y }]);
    };

    const handleSubmit = () => {
        onSubmit(actions);
    };

    return (
        <div className="task-details">
            <button className="close-button" onClick={onClose}>
                ×
            </button>
            <h3>Task Details</h3>
            <div className="task-info">
                <p>
                    <strong>ID:</strong> {task.id}
                </p>
                <p>
                    <strong>Prompt:</strong> {task.prompt}
                </p>
                <p>
                    <strong>URL:</strong> {task.url}
                </p>
                <p>
                    <strong>Created:</strong> {new Date(task.created_at * 1000).toLocaleString()}
                </p>
            </div>

            <div className="action-form">
                <h4>Add Actions</h4>
                <div className="action-buttons">
                    <button onClick={() => addClickAction(0, 0)}>Add Click Action</button>
                    <button onClick={() => addDoubleClickAction(0, 0)}>Add Double Click Action</button>
                </div>
                <div className="text-action">
                    <input
                        type="text"
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder="Text to type"
                    />
                    <button onClick={addTypeAction}>Add Type Action</button>
                </div>
                <div className="scroll-action">
                    <input
                        type="number"
                        onChange={(e) => addScrollAction(Number(e.target.value))}
                        placeholder="Scroll position"
                    />
                    <button onClick={() => addScrollAction(0)}>Add Scroll Action</button>
                </div>
            </div>

            <div className="actions-list">
                <h4>Current Actions</h4>
                <ul>
                    {actions.map((action, index) => (
                        <li key={index}>
                            {action.action}: {JSON.stringify(action.data)}
                        </li>
                    ))}
                </ul>
            </div>

            <button className="submit-button" onClick={handleSubmit}>
                Submit Actions
            </button>
        </div>
    );
};
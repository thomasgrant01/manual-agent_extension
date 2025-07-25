import React, { useState, useEffect } from 'react';
import { Task, TaskAction } from '../types';
import '../styles/TaskDetails.css';

interface TaskDetailsProps {
    task: Task;
    onClose: () => void;
    onSubmit: (actions: TaskAction[]) => void;
}

export const TaskDetails: React.FC<TaskDetailsProps> = ({ task, onClose, onSubmit }) => {
    const [actions, setActions] = useState<TaskAction[]>([]);
    const [currentAction, setCurrentAction] = useState<Partial<TaskAction>>({
        action: 'click',
        x: 0,
        y: 0,
        h: 0,
        text: ''
    });

    // Load saved actions from localStorage on component mount
    useEffect(() => {
        const savedActionsKey = `task-actions-${task.id}`;
        try {
            const savedActions = localStorage.getItem(savedActionsKey);
            if (savedActions) {
                const parsedActions = JSON.parse(savedActions);
                setActions(parsedActions);
                console.log('Restored actions from localStorage:', parsedActions);
            }
        } catch (error) {
            console.error('Failed to load saved actions from localStorage:', error);
        }
    }, [task.id]);

    // Save actions to localStorage whenever actions change
    useEffect(() => {
        const savedActionsKey = `task-actions-${task.id}`;
        try {
            localStorage.setItem(savedActionsKey, JSON.stringify(actions));
        } catch (error) {
            console.error('Failed to save actions to localStorage:', error);
        }
    }, [actions, task.id]);

    // Listen for draft actions from Alt+C
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data.type === 'ADD_DRAFT_ACTION') {
                // Only update x, y, h coordinates, preserve current action type and text
                setCurrentAction(prev => ({
                    ...prev,
                    x: event.data.action.x,
                    y: event.data.action.y,
                    h: event.data.action.h
                }));
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const navigateToTaskUrl = () => {
        if (task.url) {
            try {
                window.location.href = task.url;
            } catch (error) {
                console.error('Failed to navigate to task URL:', error);
            }
        }
    };

    const addAction = () => {
        if (currentAction.action && currentAction.x !== undefined && currentAction.y !== undefined) {
            const newAction: TaskAction = {
                action: currentAction.action as TaskAction['action'],
                x: currentAction.x,
                y: currentAction.y,
                h: currentAction.h,
                ...(currentAction.action === 'type' && { text: currentAction.text })
            };
            setActions([...actions, newAction]);
            
            // Reset form
            setCurrentAction({
                action: 'click',
                x: 0,
                y: 0,
                h: 0,
                text: ''
            });
        }
    };

    const removeAction = (index: number) => {
        setActions(actions.filter((_, i) => i !== index));
    };

    const clearAllActions = () => {
        setActions([]);
        // Also clear from localStorage
        const savedActionsKey = `task-actions-${task.id}`;
        try {
            localStorage.removeItem(savedActionsKey);
            console.log('Cleared all actions and localStorage');
        } catch (error) {
            console.error('Failed to clear actions from localStorage:', error);
        }
    };

    const handleSubmit = () => {
        if (actions.length > 0) {
            onSubmit(actions);
            
            // Clear saved actions from localStorage after successful submission
            const savedActionsKey = `task-actions-${task.id}`;
            try {
                localStorage.removeItem(savedActionsKey);
                console.log('Cleared saved actions from localStorage after submission');
            } catch (error) {
                console.error('Failed to clear saved actions from localStorage:', error);
            }
        }
    };

    const getActionIcon = (actionType: string) => {
        switch (actionType) {
            case 'click': return '👆';
            case 'type': return '⌨️';
            case 'scroll': return '📜';
            case 'hover': return '🎯';
            case 'wait': return '⏱️';
            case 'navigate': return '🧭';
            default: return '⚡';
        }
    };

    return (
        <div className="task-details">
            <div className="task-content">
                <div className="task-info-card">
                    <div className="task-meta">
                        <span className="task-id">#{task.id.slice(-6)}</span>
                        <span className="task-timestamp">
                            {new Date(task.created_at * 1000).toLocaleString()}
                        </span>
                    </div>
                    <h3 className="task-prompt">{task.prompt}</h3>
                </div>

                <div className="action-builder">
                    <h3>🛠️ Build Actions</h3>
                    
                    <div className="form-group">
                        <label>Action Type</label>
                        <select 
                            value={currentAction.action} 
                            onChange={(e) => setCurrentAction({...currentAction, action: e.target.value as TaskAction['action']})}
                        >
                            <option value="click">👆 Click</option>
                            <option value="type">⌨️ Type</option>
                            <option value="scroll">📜 Scroll</option>
                            <option value="hover">🎯 Hover</option>
                            <option value="wait">⏱️ Wait</option>
                            <option value="navigate">🧭 Navigate</option>
                        </select>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>X Position</label>
                            <input 
                                type="number" 
                                value={currentAction.x || 0}
                                onChange={(e) => setCurrentAction({...currentAction, x: Number(e.target.value)})}
                                placeholder="0"
                            />
                        </div>
                        <div className="form-group">
                            <label>Y Position</label>
                            <input 
                                type="number" 
                                value={currentAction.y || 0}
                                onChange={(e) => setCurrentAction({...currentAction, y: Number(e.target.value)})}
                                placeholder="0"
                            />
                        </div>
                        <div className="form-group">
                            <label>Height</label>
                            <input 
                                type="number" 
                                value={currentAction.h || 0}
                                onChange={(e) => setCurrentAction({...currentAction, h: Number(e.target.value)})}
                                placeholder="0"
                            />
                        </div>
                    </div>

                    {currentAction.action === 'type' && (
                        <div className="form-group">
                            <label>Text to Type</label>
                            <input 
                                type="text" 
                                value={currentAction.text || ''}
                                onChange={(e) => setCurrentAction({...currentAction, text: e.target.value})}
                                placeholder="Enter text..."
                            />
                        </div>
                    )}

                    <button className="add-action-btn" onClick={addAction}>
                        ➕ Add Action
                    </button>
                </div>

                <div className="actions-preview">
                    <div className="actions-header">
                        <h3>🎬 Action Sequence ({actions.length})</h3>
                        <div className="actions-controls">
                            {actions.length > 0 && (
                                <span className="auto-save-indicator" title="Actions are automatically saved">
                                    💾 Auto-saved
                                </span>
                            )}
                            {actions.length > 0 && (
                                <button className="clear-all-btn" onClick={clearAllActions} title="Clear all actions">
                                    🗑️ Clear All
                                </button>
                            )}
                        </div>
                    </div>
                    {actions.length === 0 ? (
                        <div className="empty-actions">
                            <p>No actions added yet. Create actions above to build your sequence.</p>
                        </div>
                    ) : (
                        <div className="actions-list">
                            {actions.map((action, index) => (
                                <div key={index} className="action-item">
                                    <div className="action-info">
                                        <span className="action-icon">{getActionIcon(action.action)}</span>
                                        <div className="action-details">
                                            <strong>{action.action}</strong>
                                            <span>x: {action.x}, y: {action.y}{action.h ? `, h: ${action.h}` : ''}</span>
                                            {action.text && <span className="action-text">"{action.text}"</span>}
                                        </div>
                                    </div>
                                    <button 
                                        className="remove-action-btn"
                                        onClick={() => removeAction(index)}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="task-footer">
                <button className="back-btn" onClick={onClose}>
                    ← Back to Tasks
                </button>
                <button 
                    className="submit-btn" 
                    onClick={handleSubmit}
                    disabled={actions.length === 0}
                >
                    🚀 Execute Actions ({actions.length})
                </button>
            </div>
        </div>
    );
};
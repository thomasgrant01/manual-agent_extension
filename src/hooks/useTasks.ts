import { useEffect, useState } from 'react';
import { Task, TaskAction } from '../types';

// Message passing utility for communication with content script
const sendMessageToExtension = (payload: any): Promise<any> => {
    return new Promise((resolve, reject) => {
        const messageId = Math.random().toString(36).substring(2);
        
        const messageHandler = (event: MessageEvent) => {
            if (event.source !== window) return;
            
            if (event.data.type === 'FROM_CONTENT_SCRIPT' && event.data.id === messageId) {
                window.removeEventListener('message', messageHandler);
                
                if (event.data.error) {
                    reject(new Error(event.data.error));
                } else {
                    resolve(event.data.response);
                }
            }
        };
        
        window.addEventListener('message', messageHandler);
        
        window.postMessage({
            type: 'FROM_REACT_APP',
            id: messageId,
            payload: payload
        }, '*');
        
        // Timeout after 10 seconds
        setTimeout(() => {
            window.removeEventListener('message', messageHandler);
            reject(new Error('Message timeout'));
        }, 10000);
    });
};

export const useTasks = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const response = await sendMessageToExtension({ action: 'fetchTasks' });
            if (response.success) {
                setTasks(response.data);
                setError(null);
            } else {
                setError(response.error);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    const updateTask = async (taskId: string, actions: TaskAction[]) => {
        try {
            setLoading(true);
            const response = await sendMessageToExtension({ 
                action: 'updateTask', 
                taskId, 
                actions 
            });
            if (response.success) {
                await fetchTasks();
                setSelectedTask(null);
            } else {
                setError(response.error);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update task');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Initial fetch
        fetchTasks();
        
        // Set up interval for periodic fetching every 5 seconds
        const interval = setInterval(() => {
            fetchTasks();
        }, 5000);
        
        // Cleanup interval on unmount
        return () => clearInterval(interval);
    }, []);

    // Also fetch when component becomes visible (if browser tab becomes active)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                fetchTasks();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    return {
        tasks,
        loading,
        error,
        selectedTask,
        setSelectedTask,
        updateTask,
        fetchTasks,
    };
};
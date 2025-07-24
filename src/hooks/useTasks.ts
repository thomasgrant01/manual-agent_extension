import { useEffect, useState } from 'react';
import { Task } from '../types';

const BACKEND_URL = 'http://deer-content-quagga.ngrok-free.app';

export const useTasks = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${BACKEND_URL}/tasks/pending?limit=100&skip=0`);
            if (!response.ok) throw new Error('Failed to fetch tasks');
            const data = await response.json();
            setTasks(data.sort((a: Task, b: Task) => a.created_at - b.created_at));
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    const updateTask = async (taskId: string, actions: TaskAction[]) => {
        try {
            setLoading(true);
            const response = await fetch(`${BACKEND_URL}/tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: 'processed',
                    actions,
                }),
            });
            if (!response.ok) throw new Error('Failed to update task');
            await fetchTasks();
            setSelectedTask(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update task');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
        const interval = setInterval(fetchTasks, 5000);
        return () => clearInterval(interval);
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
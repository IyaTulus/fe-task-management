import { useState, useCallback } from "react";
import { taskService } from "../services/task.service";
import type { Task, TaskWithValues, GetTasksParams } from "../types";

interface UseTasksReturn {
    // State
    tasks: TaskWithValues[];
    loading: boolean;
    error: string | null;
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;

    // Functions
    fetchTasks: (params?: GetTasksParams) => Promise<void>;
    createTask: (data: Omit<Task, "id" | "createdAt" | "updatedAt">) => Promise<TaskWithValues>;
    updateTask: (id: string, data: Partial<Task>) => Promise<TaskWithValues>;
    deleteTask: (id: string) => Promise<void>;

    // Pagination helpers
    setPage: (page: number) => void;
    setPageSize: (size: number) => void;
}

export function useTasks(): UseTasksReturn {
    // State
    const [tasks, setTasks] = useState<TaskWithValues[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const totalPages = Math.ceil(totalCount / pageSize);

    // Fetch tasks
    const fetchTasks = useCallback(async (params?: GetTasksParams) => {
        setLoading(true);
        setError(null);

        try {
            const response = await taskService.getTasks({ page, pageSize, ...params });
            setTasks(response.data);
            setTotalCount(response.meta.total);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Gagal mengambil data");
        } finally {
            setLoading(false);
        }
    }, [page, pageSize]);

    // Create task
    const createTask = useCallback(async (data: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
        setLoading(true);
        setError(null);

        try {
            const newTask = await taskService.createTask(data);
            setTasks((prev) => [newTask, ...prev]);
            setTotalCount((prev) => prev + 1);
            return newTask;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Gagal membuat task");
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Update task
    const updateTask = useCallback(async (id: string, data: Partial<Task>) => {
        setLoading(true);
        setError(null);

        try {
            const updatedTask = await taskService.updateTask(id, data);
            setTasks((prev) => prev.map((t) => (t.id === id ? updatedTask : t)));
            return updatedTask;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Gagal mengupdate task");
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Delete task
    const deleteTask = useCallback(async (id: string) => {
        setLoading(true);
        setError(null);

        try {
            await taskService.deleteTask(id);
            setTasks((prev) => prev.filter((t) => t.id !== id));
            setTotalCount((prev) => prev - 1);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Gagal menghapus task");
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        tasks,
        loading,
        error,
        totalCount,
        page,
        pageSize,
        totalPages,
        fetchTasks,
        createTask,
        updateTask,
        deleteTask,
        setPage,
        setPageSize,
    };
}

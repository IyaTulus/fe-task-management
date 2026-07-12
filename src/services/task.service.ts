import type { Task, TaskWithValues, GetTasksParams, PaginatedResponse } from "../types";

const sampleTasks: TaskWithValues[] = [
    { id: "1", title: "Website Redesign", description: "Redesign company website with new branding", status: "in-progress", createdAt: "2024-02-01", updatedAt: "2024-02-10", fieldValues: {} },
    { id: "2", title: "API Integration", description: "Integrate third-party payment API", status: "completed", createdAt: "2024-02-02", updatedAt: "2024-02-10", fieldValues: {} },
    { id: "3", title: "Database Migration", description: "Migrate from MySQL to PostgreSQL", status: "in-progress", createdAt: "2024-02-03", updatedAt: "2024-02-15", fieldValues: {} },
    { id: "4", title: "UI Testing", description: "Write comprehensive UI tests", status: "todo", createdAt: "2024-02-04", updatedAt: "2024-02-04", fieldValues: {} },
    { id: "5", title: "Performance Optimization", description: "Optimize database queries and caching", status: "in-progress", createdAt: "2024-02-05", updatedAt: "2024-02-12", fieldValues: {} },
    { id: "6", title: "Documentation Update", description: "Update API documentation", status: "completed", createdAt: "2024-02-06", updatedAt: "2024-02-08", fieldValues: {} },
    { id: "7", title: "Security Audit", description: "Conduct security review", status: "todo", createdAt: "2024-02-07", updatedAt: "2024-02-07", fieldValues: {} },
    { id: "8", title: "Code Review", description: "Review pull requests", status: "in-progress", createdAt: "2024-02-08", updatedAt: "2024-02-15", fieldValues: {} },
    { id: "9", title: "Deployment Setup", description: "Setup CI/CD pipeline", status: "completed", createdAt: "2024-02-09", updatedAt: "2024-02-05", fieldValues: {} },
    { id: "10", title: "User Feedback Analysis", description: "Analyze user feedback and create report", status: "todo", createdAt: "2024-02-10", updatedAt: "2024-02-10", fieldValues: {} },
];

const USE_MOCK = true;
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const taskService = {
    async getTasks(params: GetTasksParams = {}): Promise<PaginatedResponse<TaskWithValues>> {
        if (USE_MOCK) {
            await delay(500);
            const { page = 1, pageSize = 10, search = "", status } = params;

            let filtered = [...sampleTasks];

            if (search) {
                filtered = filtered.filter(
                    (task) =>
                        task.title.toLowerCase().includes(search.toLowerCase()) ||
                        task.description.toLowerCase().includes(search.toLowerCase())
                );
            }

            if (status && status !== "all") {
                filtered = filtered.filter((task) => task.status === status);
            }

            const total = filtered.length;
            const totalPages = Math.ceil(total / pageSize);
            const start = (page - 1) * pageSize;
            const end = start + pageSize;
            const data = filtered.slice(start, end);

            return { data, meta: { total, page, pageSize, totalPages } };
        }

        const query = new URLSearchParams();
        if (params.page) query.set("page", String(params.page));
        if (params.pageSize) query.set("pageSize", String(params.pageSize));
        if (params.search) query.set("search", params.search);
        if (params.status) query.set("status", params.status);

        const response = await fetch(`${API_BASE}/tasks?${query.toString()}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    },

    async getTask(id: string): Promise<TaskWithValues | null> {
        if (USE_MOCK) {
            await delay(300);
            return sampleTasks.find((task) => task.id === id) || null;
        }

        const response = await fetch(`${API_BASE}/tasks/${id}`);
        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    },

    async createTask(data: Omit<Task, "id" | "createdAt" | "updatedAt">): Promise<TaskWithValues> {
        if (USE_MOCK) {
            await delay(500);
            const newTask: TaskWithValues = {
                ...data,
                id: String(Date.now()),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                fieldValues: {},
            };
            sampleTasks.unshift(newTask);
            return newTask;
        }

        const response = await fetch(`${API_BASE}/tasks`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    },

    async updateTask(id: string, data: Partial<Task>): Promise<TaskWithValues> {
        if (USE_MOCK) {
            await delay(500);
            const index = sampleTasks.findIndex((task) => task.id === id);
            if (index === -1) throw new Error("Task tidak ditemukan");

            sampleTasks[index] = { ...sampleTasks[index], ...data, updatedAt: new Date().toISOString() };
            return sampleTasks[index];
        }

        const response = await fetch(`${API_BASE}/tasks/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    },

    async updateTaskStatus(id: string, status: Task["status"]): Promise<TaskWithValues> {
        if (USE_MOCK) {
            await delay(300);
            const index = sampleTasks.findIndex((task) => task.id === id);
            if (index === -1) throw new Error("Task tidak ditemukan");

            sampleTasks[index] = { ...sampleTasks[index], status, updatedAt: new Date().toISOString() };
            return sampleTasks[index];
        }

        const response = await fetch(`${API_BASE}/tasks/${id}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    },

    async deleteTask(id: string): Promise<void> {
        if (USE_MOCK) {
            await delay(300);
            const index = sampleTasks.findIndex((task) => task.id === id);
            if (index !== -1) sampleTasks.splice(index, 1);
            return;
        }

        const response = await fetch(`${API_BASE}/tasks/${id}`, { method: "DELETE" });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    },

    async deleteTasks(ids: string[]): Promise<void> {
        if (USE_MOCK) {
            await delay(500);
            ids.forEach((id) => {
                const index = sampleTasks.findIndex((task) => task.id === id);
                if (index !== -1) sampleTasks.splice(index, 1);
            });
            return;
        }

        const response = await fetch(`${API_BASE}/tasks/batch-delete`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids }),
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    },
};

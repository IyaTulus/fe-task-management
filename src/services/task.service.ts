import type { FormEntry, PaginatedResponse, GetEntriesParams } from "../types";

const sampleEntries: FormEntry[] = [
    {
        id: "entry-1",
        form_id: 1,
        values: {
            "Task Name": "Website Redesign",
            Description: "Redesign company website with new branding",
            Status: "In Progress",
            Priority: "High",
        },
        createdat: "2024-02-01T00:00:00Z",
        updatedat: "2024-02-10T00:00:00Z",
    },
    {
        id: "entry-2",
        form_id: 1,
        values: {
            "Task Name": "API Integration",
            Description: "Integrate third-party payment API",
            Status: "Completed",
            Priority: "Medium",
        },
        createdat: "2024-02-02T00:00:00Z",
        updatedat: "2024-02-10T00:00:00Z",
    },
    {
        id: "entry-3",
        form_id: 1,
        values: {
            "Task Name": "Database Migration",
            Description: "Migrate from MySQL to PostgreSQL",
            Status: "In Progress",
            Priority: "High",
        },
        createdat: "2024-02-03T00:00:00Z",
        updatedat: "2024-02-15T00:00:00Z",
    },
    {
        id: "entry-4",
        form_id: 1,
        values: {
            "Task Name": "UI Testing",
            Description: "Write comprehensive UI tests",
            Status: "Not Started",
            Priority: "Low",
        },
        createdat: "2024-02-04T00:00:00Z",
        updatedat: "2024-02-04T00:00:00Z",
    },
    {
        id: "entry-5",
        form_id: 1,
        values: {
            "Task Name": "Performance Optimization",
            Description: "Optimize database queries and caching",
            Status: "In Progress",
            Priority: "High",
        },
        createdat: "2024-02-05T00:00:00Z",
        updatedat: "2024-02-12T00:00:00Z",
    },
    {
        id: "entry-6",
        form_id: 1,
        values: {
            "Task Name": "Documentation Update",
            Description: "Update API documentation",
            Status: "Completed",
            Priority: "Medium",
        },
        createdat: "2024-02-06T00:00:00Z",
        updatedat: "2024-02-08T00:00:00Z",
    },
    {
        id: "entry-7",
        form_id: 1,
        values: {
            "Task Name": "Security Audit",
            Description: "Conduct security review",
            Status: "Not Started",
            Priority: "High",
        },
        createdat: "2024-02-07T00:00:00Z",
        updatedat: "2024-02-07T00:00:00Z",
    },
    {
        id: "entry-8",
        form_id: 1,
        values: {
            "Task Name": "Code Review",
            Description: "Review pull requests",
            Status: "In Progress",
            Priority: "Medium",
        },
        createdat: "2024-02-08T00:00:00Z",
        updatedat: "2024-02-15T00:00:00Z",
    },
    {
        id: "entry-9",
        form_id: 1,
        values: {
            "Task Name": "Deployment Setup",
            Description: "Setup CI/CD pipeline",
            Status: "Completed",
            Priority: "Low",
        },
        createdat: "2024-02-09T00:00:00Z",
        updatedat: "2024-02-05T00:00:00Z",
    },
    {
        id: "entry-10",
        form_id: 1,
        values: {
            "Task Name": "User Feedback Analysis",
            Description: "Analyze user feedback and create report",
            Status: "Not Started",
            Priority: "Medium",
        },
        createdat: "2024-02-10T00:00:00Z",
        updatedat: "2024-02-10T00:00:00Z",
    },
];

const USE_MOCK = true;
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper to generate unique ID
const generateId = () => `entry-${Date.now()}`;

export const entryService = {
    async getEntries(params: GetEntriesParams = {}): Promise<PaginatedResponse<FormEntry>> {
        if (USE_MOCK) {
            await delay(500);
            const { page = 1, pageSize = 10, search = "" } = params;

            let filtered = [...sampleEntries];

            // Search in all values
            if (search) {
                const searchLower = search.toLowerCase();
                filtered = filtered.filter((entry) =>
                    Object.values(entry.values).some((val) =>
                        String(val).toLowerCase().includes(searchLower)
                    )
                );
            }

            // Pagination
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

        const response = await fetch(`${API_BASE}/value_form?${query.toString()}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    },

    async getEntry(id: string): Promise<FormEntry | null> {
        if (USE_MOCK) {
            await delay(300);
            return sampleEntries.find((e) => e.id === id) || null;
        }

        const response = await fetch(`${API_BASE}/value_form/${id}`);
        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    },

    async createEntry(data: Omit<FormEntry, "id" | "createdat" | "updatedat">): Promise<FormEntry> {
        if (USE_MOCK) {
            await delay(500);
            const newEntry: FormEntry = {
                ...data,
                id: generateId(),
                createdat: new Date().toISOString(),
                updatedat: new Date().toISOString(),
            };
            sampleEntries.unshift(newEntry);
            return newEntry;
        }

        const response = await fetch(`${API_BASE}/value_form`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    },

    async updateEntry(id: string, data: Partial<Omit<FormEntry, "id" | "createdat" | "updatedat">>): Promise<FormEntry> {
        if (USE_MOCK) {
            await delay(500);
            const index = sampleEntries.findIndex((e) => e.id === id);
            if (index === -1) throw new Error("Entry tidak ditemukan");

            sampleEntries[index] = {
                ...sampleEntries[index],
                ...data,
                updatedat: new Date().toISOString(),
            };
            return sampleEntries[index];
        }

        const response = await fetch(`${API_BASE}/value_form/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    },

    async deleteEntry(id: string): Promise<void> {
        if (USE_MOCK) {
            await delay(300);
            const index = sampleEntries.findIndex((e) => e.id === id);
            if (index !== -1) sampleEntries.splice(index, 1);
            return;
        }

        const response = await fetch(`${API_BASE}/value_form/${id}`, { method: "DELETE" });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    },

    async deleteEntries(ids: string[]): Promise<void> {
        if (USE_MOCK) {
            await delay(500);
            ids.forEach((id) => {
                const index = sampleEntries.findIndex((e) => e.id === id);
                if (index !== -1) sampleEntries.splice(index, 1);
            });
            return;
        }

        const response = await fetch(`${API_BASE}/value_form/batch-delete`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids }),
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    },
};

// Backward compatibility alias
export const taskService = entryService;

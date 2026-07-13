import type { FormConfig } from "../types";

const sampleFields: FormConfig[] = [
    { id: 1, name: "Task Name", type: "text", order: 1, isRequired: true, createdat: "2024-01-01T00:00:00Z", updatedat: "2024-01-01T00:00:00Z" },
    { id: 2, name: "Description", type: "text", order: 2, isRequired: false, createdat: "2024-01-01T00:00:00Z", updatedat: "2024-01-01T00:00:00Z" },
    { id: 3, name: "Status", type: "text", order: 3, isRequired: true, createdat: "2024-01-01T00:00:00Z", updatedat: "2024-01-01T00:00:00Z" },
    { id: 4, name: "Priority", type: "text", order: 4, isRequired: false, createdat: "2024-01-01T00:00:00Z", updatedat: "2024-01-01T00:00:00Z" },
];

const USE_MOCK = true;
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const fieldService = {
    async getFields(): Promise<FormConfig[]> {
        if (USE_MOCK) {
            await delay(300);
            return [...sampleFields].sort((a, b) => a.order - b.order);
        }

        const response = await fetch(`${API_BASE}/form_tb`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    },

    async getField(id: number): Promise<FormConfig | null> {
        if (USE_MOCK) {
            await delay(200);
            return sampleFields.find((f) => f.id === id) || null;
        }

        const response = await fetch(`${API_BASE}/form_tb/${id}`);
        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    },

    async createField(data: Omit<FormConfig, "id">): Promise<FormConfig> {
        if (USE_MOCK) {
            await delay(300);
            const newField: FormConfig = {
                ...data,
                id: Math.max(...sampleFields.map(f => f.id)) + 1,
            };
            sampleFields.push(newField);
            return newField;
        }

        const response = await fetch(`${API_BASE}/form_tb`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    },

    async updateField(id: number, data: Partial<FormConfig>): Promise<FormConfig> {
        if (USE_MOCK) {
            await delay(300);
            const index = sampleFields.findIndex((f) => f.id === id);
            if (index === -1) throw new Error("Field tidak ditemukan");
            sampleFields[index] = {
                ...sampleFields[index],
                ...data,
                updatedat: new Date().toISOString(),
            };
            return sampleFields[index];
        }

        const response = await fetch(`${API_BASE}/form_tb/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    },

    async deleteField(id: number): Promise<void> {
        if (USE_MOCK) {
            await delay(300);
            const index = sampleFields.findIndex((f) => f.id === id);
            if (index !== -1) sampleFields.splice(index, 1);
            return;
        }

        const response = await fetch(`${API_BASE}/form_tb/${id}`, { method: "DELETE" });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    },

    async reorderFields(fields: FormConfig[]): Promise<FormConfig[]> {
        if (USE_MOCK) {
            await delay(300);
            fields.forEach((field, index) => {
                const localIndex = sampleFields.findIndex((f) => f.id === field.id);
                if (localIndex !== -1) {
                    sampleFields[localIndex].order = index + 1;
                }
            });
            return [...sampleFields].sort((a, b) => a.order - b.order);
        }

        const response = await fetch(`${API_BASE}/form_tb/reorder`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(fields),
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    },
};

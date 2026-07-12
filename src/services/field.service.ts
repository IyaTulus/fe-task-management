import type { FormField } from "../types";

const sampleFields: FormField[] = [
    { id: "title", name: "Task Name", type: "text", order: 1, row: 1, column: 1, isRequired: true, showInCreate: true, showInEdit: true, showInList: true },
    { id: "description", name: "Description", type: "textarea", order: 2, row: 1, column: 2, isRequired: false, showInCreate: true, showInEdit: true, showInList: true },
    { id: "status", name: "Status", type: "select", order: 3, row: 2, column: 1, isRequired: true, showInCreate: true, showInEdit: true, showInList: true },
];

const USE_MOCK = true;
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const fieldService = {
    async getFields(): Promise<FormField[]> {
        if (USE_MOCK) {
            await delay(300);
            return [...sampleFields].sort((a, b) => a.order - b.order);
        }

        const response = await fetch(`${API_BASE}/form-fields`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    },

    async getField(id: string): Promise<FormField | null> {
        if (USE_MOCK) {
            await delay(200);
            return sampleFields.find((f) => f.id === id) || null;
        }

        const response = await fetch(`${API_BASE}/form-fields/${id}`);
        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    },

    async createField(data: Omit<FormField, "id">): Promise<FormField> {
        if (USE_MOCK) {
            await delay(300);
            const newField: FormField = { ...data, id: `field_${Date.now()}` };
            sampleFields.push(newField);
            return newField;
        }

        const response = await fetch(`${API_BASE}/form-fields`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    },

    async updateField(id: string, data: Partial<FormField>): Promise<FormField> {
        if (USE_MOCK) {
            await delay(300);
            const index = sampleFields.findIndex((f) => f.id === id);
            if (index === -1) throw new Error("Field tidak ditemukan");
            sampleFields[index] = { ...sampleFields[index], ...data };
            return sampleFields[index];
        }

        const response = await fetch(`${API_BASE}/form-fields/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    },

    async deleteField(id: string): Promise<void> {
        if (USE_MOCK) {
            await delay(300);
            const index = sampleFields.findIndex((f) => f.id === id);
            if (index !== -1) sampleFields.splice(index, 1);
            return;
        }

        const response = await fetch(`${API_BASE}/form-fields/${id}`, { method: "DELETE" });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    },

    async reorderFields(fields: FormField[]): Promise<FormField[]> {
        if (USE_MOCK) {
            await delay(300);
            fields.forEach((field, index) => {
                const localIndex = sampleFields.findIndex((f) => f.id === field.id);
                if (localIndex !== -1) sampleFields[localIndex].order = index + 1;
            });
            return [...sampleFields].sort((a, b) => a.order - b.order);
        }

        const response = await fetch(`${API_BASE}/form-fields/reorder`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(fields),
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    },
};

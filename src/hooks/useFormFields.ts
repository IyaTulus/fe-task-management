import { useState, useCallback } from "react";
import { fieldService } from "../services/field.service";
import type { FormField } from "../types";

interface UseFormFieldsReturn {
    // State
    fields: FormField[];
    loading: boolean;
    error: string | null;

    // Functions
    fetchFields: () => Promise<void>;
    createField: (data: Omit<FormField, "id">) => Promise<FormField>;
    updateField: (id: number, data: Partial<FormField>) => Promise<FormField>;
    deleteField: (id: number) => Promise<void>;
    reorderFields: (fields: FormField[]) => Promise<void>;
}

export function useFormFields(): UseFormFieldsReturn {
    // State
    const [fields, setFields] = useState<FormField[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch fields
    const fetchFields = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await fieldService.getFields();
            setFields(data.sort((a, b) => a.order - b.order));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Gagal mengambil fields");
        } finally {
            setLoading(false);
        }
    }, []);

    // Create field
    const createField = useCallback(async (data: Omit<FormField, "id">) => {
        setLoading(true);
        setError(null);

        try {
            const newField = await fieldService.createField(data);
            setFields((prev) => [...prev, newField].sort((a, b) => a.order - b.order));
            return newField;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Gagal membuat field");
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Update field
    const updateField = useCallback(async (id: number, data: Partial<FormField>) => {
        setLoading(true);
        setError(null);

        try {
            const updatedField = await fieldService.updateField(id, data);
            setFields((prev) => prev.map((f) => (f.id === id ? updatedField : f)));
            return updatedField;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Gagal mengupdate field");
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Delete field
    const deleteField = useCallback(async (id: number) => {
        setLoading(true);
        setError(null);

        try {
            await fieldService.deleteField(id);
            setFields((prev) => prev.filter((f) => f.id !== id));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Gagal menghapus field");
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Reorder fields
    const reorderFields = useCallback(async (reorderedFields: FormField[]) => {
        // Optimistic update
        setFields(reorderedFields);

        try {
            await fieldService.reorderFields(reorderedFields);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Gagal reorder fields");
            await fetchFields();
        }
    }, [fetchFields]);

    return {
        fields,
        loading,
        error,
        fetchFields,
        createField,
        updateField,
        deleteField,
        reorderFields,
    };
}

import { useState, useCallback } from "react";
import { entryService } from "../services/task.service";
import type { FormEntry, GetEntriesParams } from "../types";

interface UseEntriesReturn {
    // State
    entries: FormEntry[];
    loading: boolean;
    error: string | null;
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;

    // Functions
    fetchEntries: (params?: GetEntriesParams) => Promise<void>;
    createEntry: (data: Omit<FormEntry, "id" | "createdat" | "updatedat">) => Promise<FormEntry>;
    updateEntry: (id: string, data: Partial<Omit<FormEntry, "id" | "createdat" | "updatedat">>) => Promise<FormEntry>;
    deleteEntry: (id: string) => Promise<void>;

    // Pagination helpers
    setPage: (page: number) => void;
    setPageSize: (size: number) => void;
}

export function useEntries(): UseEntriesReturn {
    // State
    const [entries, setEntries] = useState<FormEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const totalPages = Math.ceil(totalCount / pageSize);

    // Fetch entries
    const fetchEntries = useCallback(async (params?: GetEntriesParams) => {
        setLoading(true);
        setError(null);

        try {
            const response = await entryService.getEntries({ page, pageSize, ...params });
            setEntries(response.data);
            setTotalCount(response.meta.total);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Gagal mengambil data");
        } finally {
            setLoading(false);
        }
    }, [page, pageSize]);

    // Create entry
    const createEntry = useCallback(async (data: Omit<FormEntry, "id" | "createdat" | "updatedat">) => {
        setLoading(true);
        setError(null);

        try {
            const newEntry = await entryService.createEntry(data);
            setEntries((prev) => [newEntry, ...prev]);
            setTotalCount((prev) => prev + 1);
            return newEntry;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Gagal membuat entry");
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Update entry
    const updateEntry = useCallback(async (id: string, data: Partial<Omit<FormEntry, "id" | "createdat" | "updatedat">>) => {
        setLoading(true);
        setError(null);

        try {
            const updatedEntry = await entryService.updateEntry(id, data);
            setEntries((prev) => prev.map((e) => (e.id === id ? updatedEntry : e)));
            return updatedEntry;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Gagal mengupdate entry");
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Delete entry
    const deleteEntry = useCallback(async (id: string) => {
        setLoading(true);
        setError(null);

        try {
            await entryService.deleteEntry(id);
            setEntries((prev) => prev.filter((e) => e.id !== id));
            setTotalCount((prev) => prev - 1);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Gagal menghapus entry");
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        entries,
        loading,
        error,
        totalCount,
        page,
        pageSize,
        totalPages,
        fetchEntries,
        createEntry,
        updateEntry,
        deleteEntry,
        setPage,
        setPageSize,
    };
}

// Backward compatibility alias
export const useTasks = useEntries;

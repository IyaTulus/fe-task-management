// Konfigurasi Kolom Formulir (Sumber Kebenaran Tunggal)
export interface FormField {
    id: string;
    name: string; // Nama tampilan (sumber kebenaran tunggal)
    type: FieldType;
    order: number; // Urutan tampil
    row: number; // Posisi baris untuk layout formulir
    column: 1 | 2; // Posisi kolom (1-2, maks 2 per baris)
    isRequired: boolean;
    showInCreate: boolean; // Tampilkan di formulir tambah
    showInEdit: boolean; // Tampilkan di formulir ubah
    showInList: boolean; // Tampilkan di daftar tugas (kolom tabel)
}

export type FieldType = "text" | "date" | "email" | "select" | "textarea";

// Nilai Kolom Dinamis per Tugas
export interface TaskFieldValue {
    id: string;
    taskId: string;
    fieldId: string;
    value: string;
}

// Tugas (Bidang Tetap)
export interface Task {
    id: string;
    title: string;
    description: string;
    status: TaskStatus;
    createdAt: string;
    updatedAt: string;
}

export type TaskStatus = "todo" | "in-progress" | "completed";

// Tugas Terlampir dengan nilai kolom dinamis untuk tampilan tabel
export interface TaskWithValues extends Task {
    fieldValues: Record<string, string>; // fieldId -> nilai
}

// Tipe respons API
export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    };
}

export interface GetTasksParams {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string | null;
}

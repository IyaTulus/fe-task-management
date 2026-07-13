// ============================================
// form_tb - Konfigurasi Kolom (Column Definitions)
// ============================================
export interface FormConfig {
    id: number;
    name: string;           // Nama kolom
    type: FieldType;        // "text" | "datetime" | "email"
    order: number;          // Urutan tampil di tabel
    isRequired: boolean;     // Wajib diisi atau tidak
    createdat: string;
    updatedat: string;
}

export type FieldType = "text" | "datetime" | "email";

// ============================================
// value_form - Data Baris (Row Data)
// ============================================
export interface FormEntry {
    id: string;                             // Unique identifier (e.g., "entry-001")
    form_id: number;                        // Referensi ke form_tb
    values: Record<string, string | boolean>; // fieldName -> value (JSON)
    createdat: string;
    updatedat: string;
}

// ============================================
// Alias untuk backward compatibility
// ============================================
export type FormField = FormConfig;
export type Task = FormEntry;
export type TaskWithValues = FormEntry;
export type TaskFieldValue = never; // Tidak dipakai lagi

// ============================================
// Payload untuk create/update
// ============================================
export interface FormEntryPayload {
    form_id: number;
    values: Record<string, string | boolean>;
}

// ============================================
// Form values untuk UI
// ============================================
export interface FormEntryFormValues {
    values: Record<string, string | boolean>;
}

// ============================================
// Tipe respons API
// ============================================
export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    };
}

export interface GetEntriesParams {
    page?: number;
    pageSize?: number;
    search?: string;
    // filter lain bisa ditambahkan di sini
}

// ============================================
// Konstanta Built-in Fields
// ============================================
export const BUILTIN_FIELDS: FormConfig[] = [
    { id: 1, name: "Task Name", type: "text", order: 1, isRequired: true, createdat: "", updatedat: "" },
    { id: 2, name: "Description", type: "text", order: 2, isRequired: false, createdat: "", updatedat: "" },
    { id: 3, name: "Status", type: "text", order: 3, isRequired: false, createdat: "", updatedat: "" },
];

import axios from "axios";
import type {
  Task,
  GetTasksResponse,
  CustomFieldDefinition,
  CustomFieldInput,
  GetFormsResponse,
  TableColumn,
  TaskEntry,
} from "../types";

// ============================================
// API Client Setup
// ============================================

const API_BASE_URL = import.meta.env.VITE_SERVICE_API_URL || "/api";
const ORGANIZATION_ID = import.meta.env.VITE_ORGANIZATION_ID;

console.log("🔧 Service Config:", { API_BASE_URL, ORGANIZATION_ID });

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // Important: withCredentials needed for CORS
  withCredentials: false,
});

// ============================================
// Types for API Response
// ============================================

interface ApiTaskFilters {
  search: string | null;
  status: string | null;
  dueDate: string | null;
  priority: string | null;
  order_by: string;
  sort_by: "ASC" | "DESC";
  limit: number;
  page: number;
}

interface ApiGetTasksResponse {
  data: Task[];
  total: number;
  filters: ApiTaskFilters;
}

// ============================================
// Default Table Columns
// ============================================

const DEFAULT_COLUMNS: TableColumn[] = [
  { id: "title", name: "Title", type: "text", order: 1, isRequired: true, isCustom: false },
  { id: "description", name: "Description", type: "text", order: 2, isRequired: false, isCustom: false },
  { id: "dueDate", name: "Due Date", type: "datetime", order: 3, isRequired: false, isCustom: false },
  { id: "priority", name: "Priority", type: "text", order: 4, isRequired: false, isCustom: false },
  { id: "status", name: "Status", type: "text", order: 5, isRequired: false, isCustom: false },
  { id: "tags", name: "Tags", type: "text", order: 6, isRequired: false, isCustom: false },
];

// ============================================
// Form Service (GetForms API)
// ============================================

export const formService = {
  /**
   * Get custom field definitions from GetForms API
   * Returns empty array if no custom fields or API fails
   */
  async getFields(): Promise<CustomFieldDefinition[]> {
    if (!ORGANIZATION_ID) {
      console.warn("Cannot fetch forms: organizationId is missing");
      return [];
    }

    try {
      const response = await apiClient.get<GetFormsResponse>(
        `/GetForms/${ORGANIZATION_ID}`
      );
      return response.data?.data ?? response.data ?? [];
    } catch (error) {
      console.error("Failed to fetch forms:", error);
      return [];
    }
  },

  /**
   * Create a new form field
   */
  async createField(data: {
    label: string;
    type: "text" | "email" | "datetime" | "number" | "checkbox";
    is_required: boolean;
    is_active: boolean;
  }): Promise<CustomFieldDefinition> {
    if (!ORGANIZATION_ID) {
      throw new Error("organizationId is missing");
    }

    const payload = {
      organizationId: ORGANIZATION_ID,
      ...data,
    };

    const response = await apiClient.post<CustomFieldDefinition>("/InsertForm", payload);
    return response.data;
  },

  /**
   * Update an existing form field
   */
  async updateField(
    fieldId: string,
    data: {
      label?: string;
      type?: "text" | "email" | "datetime" | "number" | "checkbox";
      order?: number;
      is_required?: boolean;
      is_active?: boolean;
    }
  ): Promise<CustomFieldDefinition> {
    if (!ORGANIZATION_ID) {
      throw new Error("organizationId is missing");
    }

    const payload = {
      organizationId: ORGANIZATION_ID,
      ...data,
    };

    const response = await apiClient.put<CustomFieldDefinition>(
      `/UpdateForm/${fieldId}`,
      payload
    );
    return response.data;
  },

  /**
   * Update form field order
   */
  async updateFieldOrder(orderIds: string[]): Promise<void> {
    if (!ORGANIZATION_ID) {
      throw new Error("organizationId is missing");
    }

    await apiClient.patch("/UpdateFormOrder", {
      organizationId: ORGANIZATION_ID,
      orderIds,
    });
  },

  /**
   * Transform CustomFieldDefinition to TableColumn
   * Only includes active fields
   */
  transformToColumns(definitions: CustomFieldDefinition[]): TableColumn[] {
    return definitions
      .filter((def) => def.is_active)
      .map((def) => ({
        id: def.id,
        name: def.label,
        type: def.type,
        order: def.formOrder,
        isRequired: def.is_required,
        isCustom: true,
      }))
      .sort((a, b) => a.order - b.order);
  },
};

// ============================================
// Task Service (GetTasks API)
// ============================================

export interface TaskFilters {
  search?: string;
  status?: string;
  dueDate?: string;
  priority?: string;
  order_by?: "createdAt" | "updatedAt" | "title" | "dueDate" | "priority" | "status";
  sort_by?: "ASC" | "DESC";
}

export const taskService = {
  /**
   * Get tasks from GetTasks API
   * Endpoint: /GetTasks?organizationId=...&search=&status=&dueDate=&priority=&order_by=&sort_by=&limit=
   */
  async getTasks(params?: {
    page?: number;
    pageSize?: number;
    filters?: TaskFilters;
  }): Promise<GetTasksResponse> {
    const page = params?.page ?? 1;
    const pageSize = params?.pageSize ?? 10;
    const filters = params?.filters;

    if (!ORGANIZATION_ID) {
      console.warn("Cannot fetch tasks: organizationId is missing");
      return { data: [], meta: { total: 0, page, pageSize } };
    }

    try {
      console.log("🌐 Making API request to:", `/GetTasks`, {
        params: {
          organizationId: ORGANIZATION_ID,
          search: filters?.search || "",
          status: filters?.status || "",
          dueDate: filters?.dueDate || "",
          priority: filters?.priority || "",
          order_by: filters?.order_by || "createdAt",
          sort_by: filters?.sort_by || "ASC",
          limit: pageSize,
          page,
        },
      });

      const response = await apiClient.get<ApiGetTasksResponse>("/GetTasks", {
        params: {
          organizationId: ORGANIZATION_ID,
          search: filters?.search || "",
          status: filters?.status || "",
          dueDate: filters?.dueDate || "",
          priority: filters?.priority || "",
          order_by: filters?.order_by || "createdAt",
          sort_by: filters?.sort_by || "ASC",
          limit: pageSize,
          page,
        },
      });

      console.log("📨 API Response:", response);
      console.log("📦 Response data:", response.data);
      console.log("📊 Task count:", response.data?.data?.length);
      console.log("🔢 Total:", response.data?.total);

      return {
        data: response.data?.data ?? [],
        meta: {
          total: response.data?.total ?? 0,
          page: response.data?.filters?.page ?? page,
          pageSize: response.data?.filters?.limit ?? pageSize,
          filters: response.data?.filters,
        },
      };
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      return { data: [], meta: { total: 0, page, pageSize } };
    }
  },

  /**
   * Transform Task to TaskEntry for table display
   */
  transformToEntry(task: Task): TaskEntry {
    // Handle tags - could be array or string
    let tagsStr = "";
    if (Array.isArray(task.tags)) {
      tagsStr = task.tags.join(", ");
    } else if (typeof task.tags === "string") {
      tagsStr = task.tags;
    }

    const values: Record<string, string | number | boolean> = {
      id: task.id,
      title: task.title || "",
      description: task.description || "",
      dueDate: task.dueDate || "",
      priority: task.priority || "",
      status: task.status || "",
      tags: tagsStr,
    };

    // Add custom field values - handle both array and object formats
    if (task.customFields) {
      if (Array.isArray(task.customFields)) {
        // Array format: [{fieldId, label, value}, ...]
        for (const cf of task.customFields) {
          values[cf.label] = cf.value;
        }
      } else if (typeof task.customFields === "object") {
        // Object format: {Phone: "123", Email: "test@example.com"}
        for (const [key, val] of Object.entries(task.customFields)) {
          values[key] = val as string | number | boolean;
        }
      }
    }

    return {
      id: task.id,
      values,
      _task: task,
    };
  },

  /**
   * Create a new task
   */
  async createTask(data: {
    title: string;
    description: string;
    dueDate: string;
    priority: string;
    status: string;
    tags: string[];
    customFields?: CustomFieldInput[];
  }): Promise<Task> {
    if (!ORGANIZATION_ID) {
      throw new Error("organizationId is missing");
    }

    const payload = {
      organizationId: ORGANIZATION_ID,
      title: data.title,
      description: data.description,
      dueDate: data.dueDate,
      priority: data.priority,
      status: data.status,
      tags: data.tags,
      customFields: data.customFields,
    };

    console.log("📤 Creating task:", payload);

    const response = await apiClient.post<Task>("/InsertTask", payload);
    return response.data;
  },

  /**
   * Update an existing task
   */
  async updateTask(
    taskId: string,
    data: {
      title?: string;
      description?: string;
      dueDate?: string;
      priority?: string;
      status?: string;
      tags?: string[];
      customFields?: CustomFieldInput[];
    }
  ): Promise<Task> {
    if (!ORGANIZATION_ID) {
      throw new Error("organizationId is missing");
    }

    const payload = {
      organizationId: ORGANIZATION_ID,
      title: data.title,
      description: data.description,
      dueDate: data.dueDate,
      priority: data.priority,
      status: data.status,
      tags: data.tags,
      customFields: data.customFields,
    };

    console.log("📤 Updating task:", taskId, payload);

    const response = await apiClient.put<Task>(
      `/UpdateTask/${taskId}`,
      payload
    );
    return response.data;
  },

  /**
   * Delete a task
   */
  async deleteTask(taskId: string): Promise<void> {
    if (!ORGANIZATION_ID) {
      throw new Error("organizationId is missing");
    }

    await apiClient.delete(`/DeleteTask/${taskId}`, {
      params: { organizationId: ORGANIZATION_ID },
    });
  },
};

// ============================================
// Export default columns
// ============================================

export const getDefaultColumns = (): TableColumn[] => [...DEFAULT_COLUMNS];

export const mergeColumns = (
  defaultCols: TableColumn[],
  customCols: TableColumn[]
): TableColumn[] => {
  console.log("🔧 mergeColumns - defaultCols:", defaultCols.length, "customCols:", customCols.length);
  console.log("🔧 customCols detail:", customCols);

  // Custom fields start after default columns
  const maxDefaultOrder = Math.max(...defaultCols.map((c) => c.order));
  const adjustedCustomCols = customCols.map((c) => ({
    ...c,
    order: c.order + maxDefaultOrder,
  }));

  return [...defaultCols, ...adjustedCustomCols];
};

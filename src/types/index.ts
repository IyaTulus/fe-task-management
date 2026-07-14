// ============================================
// API Response Types
// ============================================

/** Custom field definition from GetForms API */
export interface CustomFieldDefinition {
  id: string;
  formOrder: number;
  organizationId: string;
  label: string;
  type: "text" | "email" | "datetime" | "number" | "checkbox";
  is_required: boolean;
  is_active: boolean;
  // Azure Cosmos DB metadata (ignore for business logic)
  _rid?: string;
  _self?: string;
  _etag?: string;
  _attachments?: string;
  _ts?: number;
}

/** Individual custom field value from GetTasks API */
export interface CustomField {
  fieldId: string;
  label: string;
  value: string | number | boolean;
}

/** Custom field input for Create/Update operations */
export interface CustomFieldInput {
  fieldId: string;
  label: string;
  value: string;
}

/** Task from GetTasks API */
export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority?: string;
  status?: string;
  tags?: string[];
  // customFields can be either array format or object format
  customFields?: CustomField[] | Record<string, string | number | boolean>;
  organizationId?: string;
  // Optional timestamps
  createdAt?: string;
  updatedAt?: string;
  // Azure Cosmos DB metadata fields (ignore)
  _rid?: string;
  _self?: string;
  _etag?: string;
  _attachments?: string;
  _ts?: number;
}

// ============================================
// Service Response Types
// ============================================

export interface ApiFilters {
  search: string | null;
  status: string | null;
  dueDate: string | null;
  priority: string | null;
  order_by: string;
  sort_by: "ASC" | "DESC";
  limit: number;
  page: number;
}

export interface GetTasksResponse {
  data: Task[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    filters?: ApiFilters;
  };
}

export interface GetFormsResponse {
  data: CustomFieldDefinition[];
}

// ============================================
// UI Component Types (for Table/Form compatibility)
// ============================================

/** Column configuration for the table (transformed from CustomFieldDefinition) */
export interface TableColumn {
  id: string;
  name: string;          // Display name (label from API)
  type: string;         // Field type
  order: number;        // Display order
  isRequired: boolean;
  isCustom: boolean;     // True if this is a custom field
}

/** Task entry for table display */
export interface TaskEntry {
  id: string;
  values: Record<string, string | number | boolean>;
  _task: Task;          // Original task data for reference
}

/** Form values structure */
export interface TaskFormValues {
  title: string;
  description: string;
  dueDate: string;
  priority: string;
  status: string;
  tags: string;
  customFields: Record<string, string>;
}

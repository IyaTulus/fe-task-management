# Plan: Data Layer dengan Mock Data & API Ready

## Goal
Membuat data layer yang:
- Menggunakan mock data saat development
- Mudah switch ke real API ketika backend ready
- Tidak perlu ubah component saat switching

---

## Struktur File yang Akan Dibuat

```
src/
├── types/
│   └── index.ts          # Shared TypeScript interfaces
├── services/
│   ├── index.ts          # Export semua service
│   ├── task.types.ts     # Task-specific types
│   ├── task.mock.ts      # Mock data & handler
│   └── task.api.ts       # Real API implementation (stub)
├── hooks/
│   └── useTasks.ts       # Custom hook untuk fetch tasks
└── components/Task/
    └── Table.tsx         # Update untuk use hooks
```

---

## Langkah Implementation

### Step 1: Buat Types (src/types/index.ts)
```typescript
export interface Task {
  id: string;
  name: string;
  status: "todo" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  assignee: {
    id: string;
    name: string;
    avatar?: string;
  };
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetTasksParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string | null;
  priority?: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}
```

### Step 2: Buat Mock Data & Handler (src/services/task.mock.ts)
- Pindahkan sampleTasks dari Table.tsx
- Tambah delay simulation (fake network latency)
- Tambah CRUD operations (create, update, delete)
- Simpan state di memory (mirrors real API behavior)

### Step 3: Buat API Stub (src/services/task.api.ts)
- Stub function dengan TODO comments
- Ready untuk diimplementasi dengan axios/fetch

### Step 4: Buat Service Index (src/services/index.ts)
```typescript
// Switch antara mock dan real API via environment variable
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true" || !import.meta.env.VITE_API_URL;

export const taskService = USE_MOCK ? mockTaskService : apiTaskService;
```

### Step 5: Buat Custom Hook (src/hooks/useTasks.ts)
```typescript
export function useTasks(params: GetTasksParams) {
  // Handle loading, error, data fetching
  // Sync dengan filter/search dari Table component
}
```

### Step 6: Update TaskPage
- Import dan gunakan `useTasks` hook
- Pass data ke TaskTable
- Handle loading/error states

### Step 7: Update TaskTable
- Hapus sampleTasks dan local filtering
- Terima data dari props saja
- Biarkan parent component handle filtering

---

## API Endpoints yang Di-support

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /tasks | List tasks (with pagination & filters) |
| GET | /tasks/:id | Get single task |
| POST | /tasks | Create new task |
| PUT | /tasks/:id | Update task |
| DELETE | /tasks/:id | Delete task |
| PATCH | /tasks/:id/status | Update task status |

---

## Environment Variables

```env
VITE_USE_MOCK=true          # Force mock mode
VITE_API_URL=https://api.example.com  # Real API base URL
VITE_API_TIMEOUT=5000       # Request timeout
```

---

## Benefit's

1. **Development cepat** - Tidak perlu backend untuk develop
2. **Easy switching** - 1 env var untuk switch ke real API
3. **Type safe** - Full TypeScript support
4. **Consistent API** - Interface sama untuk mock dan real
5. **Ready for testing** - Mock bisa di-mock di tests

---

## Testing the Mock

1. Run dev server - data sudah tampil
2. Switch `VITE_USE_MOCK=false` di .env
3. Set `VITE_API_URL=https://your-backend.com`
4. Ready untuk production!

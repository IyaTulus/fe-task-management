import { useEffect, useState, useCallback, useMemo } from "react";
import { Button, Card, Text, Dropdown, Option } from "@fluentui/react-components";
import { Add16Regular } from "@fluentui/react-icons";
import TaskTable from "../../components/Task/Table";
import TaskFormDrawer from "../../components/Task/Form";
import {
    taskService,
    formService,
    getDefaultColumns,
    mergeColumns,
    type TaskFilters,
} from "../../services/task.service";
import type { TaskEntry, TableColumn, CustomFieldDefinition } from "../../types";

export default function TaskPage() {
    // State
    const [entries, setEntries] = useState<TaskEntry[]>([]);
    const [columns, setColumns] = useState<TableColumn[]>([]);
    const [customFieldDefinitions, setCustomFieldDefinitions] = useState<CustomFieldDefinition[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Filter state
    const [filters, setFilters] = useState<TaskFilters>({
        search: "",
        status: "",
        dueDate: "",
        priority: "",
        order_by: "createdAt",
        sort_by: "ASC",
    });

    // Drawer state
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [drawerMode, setDrawerMode] = useState<"create" | "edit">("create");
    const [selectedEntry, setSelectedEntry] = useState<TaskEntry | null>(null);

    // Fetch custom field definitions (GetForms API)
    const fetchCustomFields = useCallback(async () => {
        try {
            console.log("🔄 Fetching custom field definitions...");
            const definitions = await formService.getFields();
            console.log("✅ Custom field definitions:", definitions);

            setCustomFieldDefinitions(definitions);

            // Transform to columns and merge with defaults
            const customCols = formService.transformToColumns(definitions);
            const defaultCols = getDefaultColumns();
            const allColumns = mergeColumns(defaultCols, customCols);

            console.log("📋 All columns:", allColumns);
            setColumns(allColumns);
        } catch (err) {
            console.error("❌ Failed to fetch custom fields:", err);
            // Fallback to default columns only
            setColumns(getDefaultColumns());
        }
    }, []);

    // Fetch tasks (GetTasks API)
    const fetchTasks = useCallback(async () => {
        setLoading(true);
        try {
            const response = await taskService.getTasks({
                page,
                pageSize,
                filters,
            });

            // Transform tasks to entries
            const taskEntries = response.data.map((task) =>
                taskService.transformToEntry(task)
            );

            setEntries(taskEntries);
            setTotalCount(response.meta.total);
        } catch (err) {
            console.error("Failed to fetch tasks:", err);
            setEntries([]);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, filters]);

    // Initial fetch - Fetch custom fields from GetForms API
    useEffect(() => {
        fetchCustomFields();
    }, [fetchCustomFields]);

    // Fetch tasks when page/pageSize/filters changes
    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    // Handle filter change
    const handleFilterChange = useCallback((key: keyof TaskFilters, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
        setPage(1); // Reset to first page when filter changes
    }, []);

    // Handle clear filters
    const handleClearFilters = useCallback(() => {
        setFilters({
            search: "",
            status: "",
            dueDate: "",
            priority: "",
            order_by: "createdAt",
            sort_by: "ASC",
        });
        setPage(1);
    }, []);

    // Handle delete
    const handleDelete = async (entry: TaskEntry) => {
        if (confirm(`Yakin hapus "${entry.values["title"]}"?`)) {
            try {
                await taskService.deleteTask(entry.id);
                await fetchTasks();
            } catch (err) {
                console.error("Failed to delete task:", err);
            }
        }
    };

    // Open create drawer
    const openCreateDrawer = () => {
        setDrawerMode("create");
        setSelectedEntry(null);
        setIsDrawerOpen(true);
    };

    // Open edit drawer
    const openEditDrawer = (entry: TaskEntry) => {
        setDrawerMode("edit");
        setSelectedEntry(entry);
        setIsDrawerOpen(true);
    };

    // Close drawer
    const closeDrawer = () => {
        setIsDrawerOpen(false);
        setSelectedEntry(null);
        setDrawerMode("create");
    };

    // Handle form submit
    const handleSubmit = async (values: Record<string, string | string[]>) => {
        try {
            // Tags is already an array from TagsInput
            const tags = Array.isArray(values.tags) ? values.tags : [];

            // Separate base task fields from custom fields
            const baseFields = {
                title: values.title,
                description: values.description || "",
                dueDate: values.dueDate,
                priority: values.priority,
                status: values.status,
                tags,
            };

            // Extract custom field values with fieldId
            const customFields = customFieldDefinitions
                .filter((def) => {
                    const val = values[def.label];
                    return val !== undefined && val !== "" && !Array.isArray(val);
                })
                .map((def) => ({
                    fieldId: def.id,
                    label: def.label,
                    value: String(values[def.label]),
                }));

            if (drawerMode === "edit" && selectedEntry) {
                // Update existing task
                await taskService.updateTask(selectedEntry.id, {
                    ...baseFields,
                    customFields: customFields.length > 0 ? customFields : undefined,
                });
            } else {
                // Create new task
                await taskService.createTask({
                    ...baseFields,
                    customFields: customFields.length > 0 ? customFields : undefined,
                });
            }

            closeDrawer();
            await fetchTasks();
        } catch (err) {
            console.error("Failed to save task:", err);
        }
    };

    // Handle search
    const handleSearch = (query: string) => {
        handleFilterChange("search", query);
    };

    // Handle page change
    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    // Handle page size change
    const handlePageSizeChange = (newSize: number) => {
        setPageSize(newSize);
        setPage(1);
    };

    // Check if any filter is active
    const hasActiveFilters = useMemo(() => {
        return (
            filters.search !== "" ||
            filters.status !== "" ||
            filters.dueDate !== "" ||
            filters.priority !== "" ||
            filters.order_by !== "createdAt" ||
            filters.sort_by !== "ASC"
        );
    }, [filters]);

    return (
        <div className="flex flex-col gap-3">
            <header className="flex w-full justify-between items-center">
                <div className="flex flex-col gap-2">
                    <Text className="text-[20px] font-semibold">Tasks</Text>
                    <Text>Manage and monitor all entries</Text>
                </div>
                <div className="flex gap-2">
                    <Button
                        appearance="primary"
                        icon={<Add16Regular />}
                        size="medium"
                        onClick={openCreateDrawer}
                    >
                        New Task
                    </Button>
                </div>
            </header>

            {/* Filter Bar */}
            <Card className="px-4 py-3">
                <div className="flex flex-wrap gap-3 items-end">
                    {/* Search */}
                    <div className="flex-1 min-w-[200px]">
                        <label className="text-xs text-[#605e5c] mb-1 block">Search</label>
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            className="w-full px-3 py-2 border border-[#e0e0e0] rounded text-sm"
                            value={filters.search}
                            onChange={(e) => handleFilterChange("search", e.target.value)}
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="min-w-[140px]">
                        <label className="text-xs text-[#605e5c] mb-1 block">Status</label>
                        <Dropdown
                            className="w-full"
                            value={filters.status || "All"}
                            onOptionSelect={(_, data) => handleFilterChange("status", data.optionValue || "")}
                        >
                            <Option value="">All</Option>
                            <Option value="todo">To Do</Option>
                            <Option value="in-progress">In Progress</Option>
                            <Option value="completed">Completed</Option>
                        </Dropdown>
                    </div>

                    {/* Priority Filter */}
                    <div className="min-w-[140px]">
                        <label className="text-xs text-[#605e5c] mb-1 block">Priority</label>
                        <Dropdown
                            className="w-full"
                            value={filters.priority || "All"}
                            onOptionSelect={(_, data) => handleFilterChange("priority", data.optionValue || "")}
                        >
                            <Option value="">All</Option>
                            <Option value="low">Low</Option>
                            <Option value="medium">Medium</Option>
                            <Option value="high">High</Option>
                        </Dropdown>
                    </div>

                    {/* Sort By */}
                    <div className="min-w-[140px]">
                        <label className="text-xs text-[#605e5c] mb-1 block">Sort By</label>
                        <Dropdown
                            className="w-full"
                            value={filters.order_by}
                            onOptionSelect={(_, data) => handleFilterChange("order_by", data.optionValue || "createdAt")}
                        >
                            <Option value="createdAt">Created At</Option>
                            <Option value="updatedAt">Updated At</Option>
                            <Option value="title">Title</Option>
                            <Option value="dueDate">Due Date</Option>
                            <Option value="priority">Priority</Option>
                            <Option value="status">Status</Option>
                        </Dropdown>
                    </div>

                    {/* Sort Direction */}
                    <div className="min-w-[100px]">
                        <label className="text-xs text-[#605e5c] mb-1 block">Order</label>
                        <Dropdown
                            className="w-full"
                            value={filters.sort_by === "ASC" ? "Ascending" : "Descending"}
                            onOptionSelect={(_, data) => handleFilterChange("sort_by", data.optionValue === "ASC" ? "ASC" : "DESC")}
                        >
                            <Option value="ASC">Ascending</Option>
                            <Option value="DESC">Descending</Option>
                        </Dropdown>
                    </div>

                    {/* Clear Filters */}
                    {hasActiveFilters && (
                        <Button appearance="subtle" onClick={handleClearFilters} className="self-end">
                            Clear Filters
                        </Button>
                    )}
                </div>
            </Card>

            <Card className="px-0!">
                <TaskTable
                    entries={entries}
                    columns={columns}
                    totalCount={totalCount}
                    page={page}
                    pageSize={pageSize}
                    loading={loading}
                    onEdit={openEditDrawer}
                    onDelete={handleDelete}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    onSearch={handleSearch}
                />
            </Card>

            <TaskFormDrawer
                open={isDrawerOpen}
                mode={drawerMode}
                entry={selectedEntry}
                columns={columns}
                customFieldDefinitions={customFieldDefinitions}
                loading={loading}
                onClose={closeDrawer}
                onSubmit={handleSubmit}
            />
        </div>
    );
}

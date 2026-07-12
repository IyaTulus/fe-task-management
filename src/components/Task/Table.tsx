import { useState, useMemo } from "react";
import {
    Badge,
    Button,
    Checkbox,
    Dropdown,
    Input,
    Link,
    Menu,
    MenuItem,
    MenuList,
    MenuPopover,
    MenuTrigger,
    Option,
    Spinner,
    Text,
} from "@fluentui/react-components";
import {
    Search24Regular,
    MoreVertical24Filled,
    Edit16Regular,
    Delete16Regular,
    ChevronLeft24Regular,
    ChevronRight24Filled,
    Dismiss16Regular,
} from "@fluentui/react-icons";
import type { FormField, Task, TaskWithValues, TaskStatus } from "../../types";

const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

const getStatusBadgeColor = (status: TaskStatus): "informative" | "success" | "subtle" => {
    switch (status) {
        case "in-progress":
            return "informative";
        case "completed":
            return "success";
        case "todo":
        default:
            return "subtle";
    }
};

const getStatusLabel = (status: TaskStatus): string => {
    switch (status) {
        case "in-progress":
            return "In Progress";
        case "completed":
            return "Completed";
        case "todo":
        default:
            return "To Do";
    }
};

interface TaskTableProps {
    // Data
    tasks?: TaskWithValues[];
    fieldValues?: Record<string, Record<string, string>>;

    // Column configuration (dari form_fields)
    columns?: FormField[];

    // Pagination
    totalCount?: number;
    page?: number;
    pageSize?: number;
    loading?: boolean;

    // Filters
    enableStatusFilter?: boolean;
    enablePriorityFilter?: boolean;

    // Callbacks
    onPageChange?: (page: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
    onSearch?: (query: string) => void;
    onStatusFilter?: (status: string | null) => void;
    onEdit?: (task: Task) => void;
    onDelete?: (task: Task) => void;
    onSelectionChange?: (selectedIds: string[]) => void;
}

type StatusFilter = "all" | TaskStatus;

const tableHeaderClasses = "bg-[#f5f5f5] font-semibold text-[#605e5c] text-xs uppercase tracking-wide text-left";
const tableCellClasses = "text-sm text-[#323130]";
export default function TaskTable({
    tasks = [],
    columns = [],
    totalCount = 10,
    page = 1,
    pageSize = 10,
    loading = false,
    enableStatusFilter = true,
    onPageChange,
    onPageSizeChange,
    onSearch,
    onStatusFilter,
    onEdit,
    onDelete,
    onSelectionChange,
}: TaskTableProps) {
    // Local state
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [localPageSize, setLocalPageSize] = useState(pageSize);

    const tableColumns = useMemo(() => {
        return columns
            .filter((col) => col.showInList) // Hanya yang showInList
            .sort((a, b) => a.order - b.order); // Sort by order
    }, [columns]);

    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            // Search filter
            const matchesSearch =
                searchQuery === "" ||
                task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.description.toLowerCase().includes(searchQuery.toLowerCase());

            // Status filter
            const matchesStatus = statusFilter === "all" || task.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [tasks, searchQuery, statusFilter]);

    const handleSearch = (value: string) => {
        setSearchQuery(value);
        onSearch?.(value);
    };

    const handleStatusFilter = (_event: React.SyntheticEvent, data: { optionValue?: string }) => {
        const value = data.optionValue as StatusFilter;
        setStatusFilter(value);
        onStatusFilter?.(value === "all" ? null : value);
    };

    const handleClearFilters = () => {
        setSearchQuery("");
        setStatusFilter("all");
        onSearch?.("");
        onStatusFilter?.(null);
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const allIds = new Set(filteredTasks.map((t) => t.id));
            setSelectedIds(allIds);
            onSelectionChange?.(Array.from(allIds));
        } else {
            setSelectedIds(new Set());
            onSelectionChange?.([]);
        }
    };

    const handleSelectRow = (id: string, checked: boolean) => {
        const newSelected = new Set(selectedIds);
        if (checked) {
            newSelected.add(id);
        } else {
            newSelected.delete(id);
        }
        setSelectedIds(newSelected);
        onSelectionChange?.(Array.from(newSelected));
    };

    const handlePageSizeChange = (_event: React.SyntheticEvent, data: { optionValue?: string }) => {
        const newSize = parseInt(data.optionValue || "10", 10);
        setLocalPageSize(newSize);
        onPageSizeChange?.(newSize);
        onPageChange?.(1);
    };

    const handlePrevPage = () => {
        if (page > 1) {
            onPageChange?.(page - 1);
        }
    };

    const handleNextPage = () => {
        const totalPages = Math.ceil(totalCount / localPageSize);
        if (page < totalPages) {
            onPageChange?.(page + 1);
        }
    };

    const renderCell = (field: FormField, task: TaskWithValues) => {
        // Get value dari task field atau dari fieldValues
        const value = task[field.id as keyof TaskWithValues] as string | undefined;

        switch (field.type) {
            case "date":
                return (
                    <span className={tableCellClasses}>
                        {value ? formatDate(value) : "-"}
                    </span>
                );

            case "email":
                return value ? (
                    <Link href={`mailto:${value}`}>{value}</Link>
                ) : (
                    <span className="text-[#a19f9d]">-</span>
                );

            case "select":
                if (field.id === "status") {
                    return (
                        <Badge
                            className="rounded-full px-3 py-0.5 text-xs font-medium"
                            appearance="filled"
                            color={getStatusBadgeColor(task.status)}
                        >
                            {getStatusLabel(task.status)}
                        </Badge>
                    );
                }
                return (
                    <span className={tableCellClasses}>{value || "-"}</span>
                );

            case "textarea":
                return (
                    <span className={`${tableCellClasses} line-clamp-2 max-w-xs`}>
                        {value || "-"}
                    </span>
                );

            case "text":
            default:
                return (
                    <span className={`${tableCellClasses} font-medium`}>
                        {value || "-"}
                    </span>
                );
        }
    };

    const hasActiveFilters = searchQuery !== "" || statusFilter !== "all";
    const startItem = (page - 1) * localPageSize + 1;
    const endItem = Math.min(page * localPageSize, totalCount);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap px-3 items-center gap-3">
                {/* Search */}
                <div className="w-64">
                    <Input
                        contentBefore={<Search24Regular />}
                        placeholder="Search"
                        value={searchQuery}
                        onChange={(_e, data) => handleSearch(data.value)}
                        className="w-full"
                    />
                </div>

                {enableStatusFilter && (
                    <Dropdown
                        placeholder="All Status"
                        value={
                            statusFilter === "all"
                                ? "All Status"
                                : getStatusLabel(statusFilter as TaskStatus)
                        }
                        onOptionSelect={handleStatusFilter}
                        className="w-40"
                    >
                        <Option value="all">All Status</Option>
                        <Option value="todo">To Do</Option>
                        <Option value="in-progress">In Progress</Option>
                        <Option value="completed">Completed</Option>
                    </Dropdown>
                )}

                {hasActiveFilters && (
                    <Button appearance="subtle" icon={<Dismiss16Regular />} onClick={handleClearFilters}>
                        Clear filters
                    </Button>
                )}
            </div>

            <div className="overflow-x-auto border border-[#e0e0e0]">
                <table className="w-full border-collapse bg-white">
                    <thead>
                        <tr className="bg-[#f5f5f5]">
                            <th className="w-12 px-4 py-3 text-left">
                                <Checkbox
                                    checked={
                                        filteredTasks.length > 0 &&
                                        selectedIds.size === filteredTasks.length
                                    }
                                    onChange={(_e, data) => handleSelectAll(!!data.checked)}
                                />
                            </th>

                            {tableColumns.map((col) => (
                                <th key={col.id} className={`px-4 py-3 ${tableHeaderClasses}`}>
                                    {col.name}
                                </th>
                            ))}

                            <th className="w-12 px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={tableColumns.length + 2} className="px-4 py-8 text-center">
                                    <Spinner />
                                </td>
                            </tr>
                        ) : filteredTasks.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={tableColumns.length + 2}
                                    className="px-4 py-8 text-center text-[#605e5c]"
                                >
                                    <Text>No tasks found</Text>
                                </td>
                            </tr>
                        ) : (
                            filteredTasks.map((task) => (
                                <tr key={task.id} className="border-t border-[#e0e0e0] hover:bg-[#f5f5f5]">

                                    <td className="px-4 py-3">
                                        <Checkbox
                                            checked={selectedIds.has(task.id)}
                                            onChange={(_e, data) => handleSelectRow(task.id, !!data.checked)}
                                        />
                                    </td>

                                    {tableColumns.map((col) => (
                                        <td key={col.id} className="px-4 py-3">
                                            {renderCell(col, task)}
                                        </td>
                                    ))}

                                    <td className="px-4 py-3">
                                        <div className="flex justify-end">
                                            <Menu>
                                                <MenuTrigger>
                                                    <Button
                                                        appearance="subtle"
                                                        icon={<MoreVertical24Filled />}
                                                        size="small"
                                                        aria-label="Actions"
                                                    />
                                                </MenuTrigger>
                                                <MenuPopover>
                                                    <MenuList>
                                                        <MenuItem
                                                            icon={<Edit16Regular />}
                                                            onClick={() => onEdit?.(task)}
                                                        >
                                                            Edit
                                                        </MenuItem>
                                                        <MenuItem
                                                            icon={<Delete16Regular />}
                                                            onClick={() => onDelete?.(task)}
                                                        >
                                                            Delete
                                                        </MenuItem>
                                                    </MenuList>
                                                </MenuPopover>
                                            </Menu>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center px-3 justify-between">
                <span className="text-xs text-[#605e5c]">
                    Showing {startItem}-{endItem} of {totalCount} results
                </span>
                <div className="flex items-center gap-2">
                    <Button
                        appearance="subtle"
                        icon={<ChevronLeft24Regular />}
                        onClick={handlePrevPage}
                        disabled={page === 1}
                        aria-label="Previous page"
                    />
                    <Button
                        appearance="subtle"
                        icon={<ChevronRight24Filled />}
                        onClick={handleNextPage}
                        disabled={page >= Math.ceil(totalCount / localPageSize)}
                        aria-label="Next page"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-[#605e5c]">Rows per page:</span>
                    <Dropdown
                        value={localPageSize.toString()}
                        onOptionSelect={handlePageSizeChange}
                        className="w-20"
                    >
                        <Option value="5">5</Option>
                        <Option value="10">10</Option>
                        <Option value="20">20</Option>
                        <Option value="50">50</Option>
                    </Dropdown>
                </div>
            </div>
        </div>
    );
}

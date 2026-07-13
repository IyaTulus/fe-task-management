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
import type { FormConfig, FormEntry } from "../../types";

const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

const getStatusBadgeColor = (status: string): "success" | "subtle" => {
    return status === "Completed" ? "success" : "subtle";
};

const tableHeaderClasses = "bg-[#f5f5f5] font-semibold text-[#605e5c] text-xs uppercase tracking-wide text-left";
const tableCellClasses = "text-sm text-[#323130]";

interface TaskTableProps {
    // Data
    entries?: FormEntry[];
    columns?: FormConfig[];

    // Pagination
    totalCount?: number;
    page?: number;
    pageSize?: number;
    loading?: boolean;

    // Callbacks
    onPageChange?: (page: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
    onSearch?: (query: string) => void;
    onEdit?: (entry: FormEntry) => void;
    onDelete?: (entry: FormEntry) => void;
    onSelectionChange?: (selectedIds: string[]) => void;
}

export default function TaskTable({
    entries = [],
    columns = [],
    totalCount = 0,
    page = 1,
    pageSize = 10,
    loading = false,
    onPageChange,
    onPageSizeChange,
    onSearch,
    onEdit,
    onDelete,
    onSelectionChange,
}: TaskTableProps) {
    // Local state
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [localPageSize, setLocalPageSize] = useState(pageSize);

    const tableColumns = useMemo(() => {
        return [...columns].sort((a, b) => a.order - b.order);
    }, [columns]);

    const handleSearch = (value: string) => {
        setSearchQuery(value);
        onSearch?.(value);
    };

    const handleClearFilters = () => {
        setSearchQuery("");
        onSearch?.("");
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const allIds = new Set(entries.map((e) => e.id));
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

    const renderCell = (column: FormConfig, entry: FormEntry) => {
        const value = entry.values[column.name];

        switch (column.name) {
            case "Task Name":
                return (
                    <span className={`${tableCellClasses} font-medium`}>
                        {String(value ?? "-")}
                    </span>
                );

            case "Description":
                return (
                    <span className={`${tableCellClasses} line-clamp-2 max-w-xs`}>
                        {String(value ?? "-")}
                    </span>
                );

            case "Status":
                return (
                    <Badge
                        className="rounded-full px-3 py-0.5 text-xs font-medium"
                        appearance="filled"
                        color={getStatusBadgeColor(String(value))}
                    >
                        {String(value ?? "-")}
                    </Badge>
                );

            case "Created At":
            case "Updated At":
                return (
                    <span className={tableCellClasses}>
                        {value ? formatDate(String(value)) : "-"}
                    </span>
                );

            default:
                // Dynamic fields
                if (column.type === "email" && value) {
                    return <Link href={`mailto:${value}`}>{String(value)}</Link>;
                }
                return (
                    <span className={tableCellClasses}>
                        {value !== undefined && value !== "" ? String(value) : "-"}
                    </span>
                );
        }
    };

    const hasActiveFilters = searchQuery !== "";
    const startItem = Math.min((page - 1) * localPageSize + 1, totalCount);
    const endItem = Math.min(page * localPageSize, totalCount);

    return (
        <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="flex flex-wrap px-3 items-center gap-3">
                <div className="w-64">
                    <Input
                        contentBefore={<Search24Regular />}
                        placeholder="Search"
                        value={searchQuery}
                        onChange={(_e, data) => handleSearch(data.value)}
                        className="w-full"
                    />
                </div>

                {hasActiveFilters && (
                    <Button appearance="subtle" icon={<Dismiss16Regular />} onClick={handleClearFilters}>
                        Clear filters
                    </Button>
                )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-[#e0e0e0]">
                <table className="w-full border-collapse bg-white">
                    <thead>
                        <tr className="bg-[#f5f5f5]">
                            <th className="w-12 px-4 py-3 text-left">
                                <Checkbox
                                    checked={
                                        entries.length > 0 &&
                                        selectedIds.size === entries.length
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
                        ) : entries.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={tableColumns.length + 2}
                                    className="px-4 py-8 text-center text-[#605e5c]"
                                >
                                    <Text>No data found</Text>
                                </td>
                            </tr>
                        ) : (
                            entries.map((entry) => (
                                <tr key={entry.id} className="border-t border-[#e0e0e0] hover:bg-[#f5f5f5]">
                                    <td className="px-4 py-3">
                                        <Checkbox
                                            checked={selectedIds.has(entry.id)}
                                            onChange={(_e, data) => handleSelectRow(entry.id, !!data.checked)}
                                        />
                                    </td>

                                    {tableColumns.map((col) => (
                                        <td key={col.id} className="px-4 py-3">
                                            {renderCell(col, entry)}
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
                                                            onClick={() => onEdit?.(entry)}
                                                        >
                                                            Edit
                                                        </MenuItem>
                                                        <MenuItem
                                                            icon={<Delete16Regular />}
                                                            onClick={() => onDelete?.(entry)}
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

            {/* Pagination */}
            <div className="flex items-center px-3 justify-between">
                <span className="text-xs text-[#605e5c]">
                    Showing {totalCount > 0 ? `${startItem}-${endItem}` : "0"} of {totalCount} results
                </span>
                <div className="flex items-center gap-2">
                    <Button
                        appearance="subtle"
                        icon={<ChevronLeft24Regular />}
                        onClick={handlePrevPage}
                        disabled={page === 1 || totalCount === 0}
                        aria-label="Previous page"
                    />
                    <Button
                        appearance="subtle"
                        icon={<ChevronRight24Filled />}
                        onClick={handleNextPage}
                        disabled={page >= Math.ceil(totalCount / localPageSize) || totalCount === 0}
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

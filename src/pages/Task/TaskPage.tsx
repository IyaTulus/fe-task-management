import { useEffect, useState } from "react";
import {
    Button,
    Card,
    Text,
} from "@fluentui/react-components";
import { Add16Regular, Filter16Filled } from "@fluentui/react-icons";
import TaskTable from "../../components/Task/Table";
import TaskFormDrawer from "../../components/Task/Form";
import { entryService } from "../../services/task.service";
import { fieldService } from "../../services/field.service";
import type { FormEntry, FormConfig, FormEntryFormValues } from "../../types";

export default function TaskPage() {
    // State
    const [entries, setEntries] = useState<FormEntry[]>([]);
    const [columns, setColumns] = useState<FormConfig[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Drawer state
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [drawerMode, setDrawerMode] = useState<"create" | "edit">("create");
    const [selectedEntry, setSelectedEntry] = useState<FormEntry | null>(null);

    // Fetch columns (form_tb)
    const fetchColumns = async () => {
        try {
            const data = await fieldService.getFields();
            setColumns(data);
        } catch (err) {
            console.error("Failed to fetch columns:", err);
        }
    };

    // Fetch entries (value_form)
    const fetchEntries = async (params?: { search?: string }) => {
        setLoading(true);
        try {
            const response = await entryService.getEntries({
                page,
                pageSize,
                search: params?.search,
            });
            setEntries(response.data);
            setTotalCount(response.meta.total);
        } catch (err) {
            console.error("Failed to fetch entries:", err);
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchColumns();
        fetchEntries();
    }, []);

    // Refetch when page/pageSize changes
    useEffect(() => {
        fetchEntries();
    }, [page, pageSize]);

    // Handle delete
    const handleDelete = async (entry: FormEntry) => {
        if (confirm(`Yakin hapus "${entry.values["Task Name"]}"?`)) {
            try {
                await entryService.deleteEntry(entry.id);
                await fetchEntries();
            } catch (err) {
                console.error("Failed to delete:", err);
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
    const openEditDrawer = (entry: FormEntry) => {
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
    const handleSubmit = async (values: FormEntryFormValues) => {
        try {
            if (drawerMode === "edit" && selectedEntry) {
                await entryService.updateEntry(selectedEntry.id, {
                    form_id: selectedEntry.form_id,
                    values: values.values,
                });
            } else {
                await entryService.createEntry({
                    form_id: 1, // Default form_id
                    values: values.values,
                });
            }

            closeDrawer();
            await fetchEntries();
        } catch (err) {
            console.error("Failed to save:", err);
        }
    };

    // Handle search
    const handleSearch = (query: string) => {
        setPage(1);
        fetchEntries({ search: query });
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

    return (
        <div className="flex flex-col gap-3">
            <header className="flex w-full justify-between items-center">
                <div className="flex flex-col gap-2">
                    <Text className="text-[20px] font-semibold">Tasks</Text>
                    <Text>Manage and monitor all entries</Text>
                </div>
                <div className="flex gap-2">
                    <Button appearance="primary" icon={<Add16Regular />} size="medium" onClick={openCreateDrawer}>
                        New Entry
                    </Button>
                    <Button appearance="outline" icon={<Filter16Filled />} size="medium">
                        Filter
                    </Button>
                </div>
            </header>

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
                loading={loading}
                onClose={closeDrawer}
                onSubmit={handleSubmit}
            />
        </div>
    );
}

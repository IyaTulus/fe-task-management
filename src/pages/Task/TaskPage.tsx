import { useEffect } from "react";
import {
    Button,
    Card,
    Text,
} from "@fluentui/react-components";
import { Add16Regular, Filter16Filled } from "@fluentui/react-icons";
import TaskTable from "../../components/Task/Table";
import { useTasks } from "../../hooks/useTasks";
import { useFormFields } from "../../hooks/useFormFields";

export default function TaskPage() {
    const {
        tasks,
        loading,
        totalCount,
        page,
        pageSize,
        fetchTasks,
        deleteTask,
        setPage,
        setPageSize,
    } = useTasks();

    const { fields, fetchFields } = useFormFields();

    // Fetch data saat mount
    useEffect(() => {
        fetchTasks();
        fetchFields();
    }, []);

    // Handle delete
    const handleDelete = async (task: { id: string }) => {
        if (confirm("Yakin hapus task ini?")) {
            await deleteTask(task.id);
        }
    };

    // Handle page change
    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        fetchTasks({ page: newPage, pageSize });
    };

    // Handle page size change
    const handlePageSizeChange = (newSize: number) => {
        setPageSize(newSize);
        fetchTasks({ page: 1, pageSize: newSize });
    };

    return (
        <div className="flex flex-col gap-3">
            <header className="flex w-full justify-between items-center">
                <div className="flex flex-col gap-2">
                    <Text className="text-[20px] font-semibold">Tasks</Text>
                    <Text>Manage and monitor all tasks</Text>
                </div>
                <div className="flex gap-2">
                    <Button appearance="primary" icon={<Add16Regular />} size="medium">
                        New Task
                    </Button>
                    <Button appearance="outline" icon={<Filter16Filled />} size="medium">
                        Filter
                    </Button>
                </div>
            </header>

            <Card className="px-0!">
                <TaskTable
                    tasks={tasks}
                    columns={fields}
                    totalCount={totalCount}
                    page={page}
                    pageSize={pageSize}
                    loading={loading}
                    onDelete={handleDelete}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                />
            </Card>
        </div>
    );
}

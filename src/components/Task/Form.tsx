import { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Button,
    Field,
    Input,
    Spinner,
    Text,
    makeStyles,
    tokens,
    Textarea,
    Dropdown,
    Option,
} from "@fluentui/react-components";
import { Dismiss16Regular } from "@fluentui/react-icons";
import TagsInput from "./TagsInput";
import type { TableColumn, TaskEntry, CustomFieldDefinition } from "../../types";

interface TaskFormDrawerProps {
    open: boolean;
    mode: "create" | "edit";
    entry?: TaskEntry | null;
    columns: TableColumn[];
    customFieldDefinitions?: CustomFieldDefinition[];
    loading?: boolean;
    onClose: () => void;
    onSubmit: (values: TaskFormValues) => Promise<void> | void;
}

export interface TaskFormValues {
    title: string;
    description: string;
    dueDate: string;
    priority: string;
    status: string;
    tags: string[];
    [key: string]: string | string[];
}

const useStyles = makeStyles({
    overlay: {
        backgroundColor: "rgba(0, 0, 0, 0.35)",
    },
    panel: {
        backgroundColor: tokens.colorNeutralBackground1,
        boxShadow: tokens.shadow64,
    },
    header: {
        borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    },
    footer: {
        borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    },
});

// Build Zod schema dynamically from columns
function buildSchema(columns: TableColumn[]) {
    const shape: Record<string, z.ZodTypeAny> = {};

    // Base task fields
    shape["title"] = z.string().min(1, "Title wajib diisi");
    shape["description"] = z.string().optional();
    shape["dueDate"] = z.string().optional();
    shape["priority"] = z.string().min(1, "Priority wajib dipilih");
    shape["status"] = z.string().min(1, "Status wajib dipilih");
    shape["tags"] = z.array(z.string()).optional().default([]);

    // Custom fields validation
    for (const col of columns) {
        if (!col.isCustom) continue;

        if (col.type === "email") {
            if (col.isRequired) {
                shape[col.name] = z.string().email("Format email tidak valid").min(1, `${col.name} wajib diisi`);
            } else {
                shape[col.name] = z.string().email("Format email tidak valid").optional();
            }
        } else if (col.type === "datetime") {
            if (col.isRequired) {
                shape[col.name] = z.string().min(1, `${col.name} wajib diisi`);
            } else {
                shape[col.name] = z.string().optional();
            }
        } else {
            if (col.isRequired) {
                shape[col.name] = z.string().min(1, `${col.name} wajib diisi`);
            } else {
                shape[col.name] = z.string().optional();
            }
        }
    }

    return z.object(shape);
}

// Get default values from entry
function getDefaultValues(
    entry: TaskEntry | null | undefined,
    customFieldLabels: string[]
): TaskFormValues {
    const values: TaskFormValues = {
        title: "",
        description: "",
        dueDate: "",
        priority: "medium",
        status: "todo",
        tags: [],
    };

    if (entry) {
        // Edit mode: use existing values from entry._task
        const task = entry._task;
        values.title = task.title || "";
        values.description = task.description || "";
        values.dueDate = task.dueDate ? task.dueDate.split("T")[0] : "";
        values.priority = task.priority || "medium";
        values.status = task.status || "todo";
        values.tags = task.tags || [];

        // Add custom field values
        if (task.customFields) {
            for (const cf of task.customFields) {
                values[cf.label] = String(cf.value || "");
            }
        }
    }

    // Ensure all custom field labels are present
    for (const label of customFieldLabels) {
        if (values[label] === undefined) {
            values[label] = "";
        }
    }

    return values;
}

// Get custom field labels from columns
function getCustomFieldLabels(columns: TableColumn[]): string[] {
    return columns.filter((col) => col.isCustom).map((col) => col.name);
}

// Split columns for 2-column layout (exclude tags from here)
function splitColumnsByOrder(columns: TableColumn[]): [TableColumn[], TableColumn[]] {
    const sorted = [...columns]
        .filter((col) => col.id !== "tags")
        .sort((a, b) => a.order - b.order);
    const midpoint = Math.ceil(sorted.length / 2);
    return [sorted.slice(0, midpoint), sorted.slice(midpoint)];
}

export default function TaskFormDrawer({
    open,
    mode,
    entry,
    columns,
    loading = false,
    onClose,
    onSubmit,
}: TaskFormDrawerProps) {
    const styles = useStyles();

    // Get only custom field columns
    const customFieldLabels = useMemo(() => getCustomFieldLabels(columns), [columns]);

    // Default columns (non-custom, exclude tags)
    const defaultColumns = useMemo(
        () => [...columns].filter((col) => !col.isCustom && col.id !== "tags").sort((a, b) => a.order - b.order),
        [columns]
    );

    // All columns sorted
    const sortedColumns = useMemo(
        () => [...columns].sort((a, b) => a.order - b.order),
        [columns]
    );

    // Schema for validation
    const schema = useMemo(() => buildSchema(columns), [columns]);

    // Default values
    const defaultValues = useMemo(
        () => getDefaultValues(entry, customFieldLabels),
        [entry, customFieldLabels]
    );

    const [col1, col2] = useMemo(() => splitColumnsByOrder(defaultColumns), [defaultColumns]);

    const {
        control,
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<TaskFormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(schema) as any,
        defaultValues,
        mode: "onBlur",
    });

    // Reset form when entry or open state changes
    useEffect(() => {
        if (open) {
            reset(defaultValues);
        }
    }, [defaultValues, reset, open]);

    const handleFormSubmit = handleSubmit(async (values) => {
        await onSubmit(values);
    });

    // Get error for a field
    const getError = (fieldName: string): string | undefined => {
        const err = errors[fieldName];
        return err?.message as string | undefined;
    };

    // Render default field
    const renderDefaultField = (col: TableColumn) => {
        switch (col.id) {
            case "title":
                return (
                    <Field
                        label="Title"
                        required={true}
                        validationState={errors.title ? "error" : "none"}
                        validationMessage={errors.title?.message}
                    >
                        <Input placeholder="Enter task title" {...register("title")} />
                    </Field>
                );

            case "description":
                return (
                    <Field
                        label="Description"
                        validationState={errors.description ? "error" : "none"}
                        validationMessage={errors.description?.message}
                    >
                        <Textarea placeholder="Enter task description" rows={3} {...register("description")} />
                    </Field>
                );

            case "dueDate":
                return (
                    <Field
                        label="Due Date"
                        validationState={errors.dueDate ? "error" : "none"}
                        validationMessage={errors.dueDate?.message}
                    >
                        <Input type="date" placeholder="Select due date" {...register("dueDate")} />
                    </Field>
                );

            case "priority":
                return (
                    <Field
                        label="Priority"
                        required={true}
                        validationState={errors.priority ? "error" : "none"}
                        validationMessage={errors.priority?.message}
                    >
                        <Dropdown placeholder="Select priority" {...register("priority")}>
                            <Option value="low">Low</Option>
                            <Option value="medium">Medium</Option>
                            <Option value="high">High</Option>
                        </Dropdown>
                    </Field>
                );

            case "status":
                return (
                    <Field
                        label="Status"
                        required={true}
                        validationState={errors.status ? "error" : "none"}
                        validationMessage={errors.status?.message}
                    >
                        <Dropdown placeholder="Select status" {...register("status")}>
                            <Option value="todo">To Do</Option>
                            <Option value="in-progress">In Progress</Option>
                            <Option value="completed">Completed</Option>
                        </Dropdown>
                    </Field>
                );

            default:
                return null;
        }
    };

    // Render custom field
    const renderCustomField = (col: TableColumn) => {
        const error = getError(col.name);

        return (
            <Field
                key={col.id}
                label={col.name}
                required={col.isRequired}
                validationState={error ? "error" : "none"}
                validationMessage={error}
            >
                {col.type === "datetime" ? (
                    <Input type="date" placeholder={`Select ${col.name.toLowerCase()}`} {...register(col.name)} />
                ) : col.type === "email" ? (
                    <Input type="email" placeholder={`Enter ${col.name.toLowerCase()}`} {...register(col.name)} />
                ) : (
                    <Input placeholder={`Enter ${col.name.toLowerCase()}`} {...register(col.name)} />
                )}
            </Field>
        );
    };

    // Custom fields only
    const customFields = useMemo(() => columns.filter((col) => col.isCustom), [columns]);

    return (
        <div
            className={`fixed inset-0 z-50 transition ${open ? "pointer-events-auto" : "pointer-events-none"}`}
            aria-hidden={!open}
        >
            <button
                type="button"
                className={`absolute inset-0 h-full w-full border-0 ${styles.overlay} transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
                onClick={onClose}
                aria-label="Close drawer overlay"
            />

            <aside
                className={`absolute right-0 top-0 h-full w-full max-w-2xl ${styles.panel} transform transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "translate-x-full"}`}
                role="dialog"
                aria-modal="true"
                aria-label={mode === "create" ? "Create task" : "Edit task"}
            >
                <div className={`flex h-full flex-col ${styles.header}`}>
                    {/* Header */}
                    <div className="flex items-center justify-between gap-4 px-6 py-5">
                        <div className="flex flex-col gap-1">
                            <Text className="text-xl font-semibold">
                                {mode === "create" ? "New Task" : "Edit Task"}
                            </Text>
                            <Text className="text-sm text-[#605e5c]">
                                {mode === "create" ? "Create new task with dynamic fields" : "Update task details"}
                            </Text>
                        </div>

                        <Button appearance="subtle" icon={<Dismiss16Regular />} onClick={onClose} aria-label="Close drawer" />
                    </div>

                    {/* Form */}
                    <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleFormSubmit}>
                        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
                            {/* Default Fields Section */}
                            <div className="mb-6">
                                <Text className="mb-3 block text-sm font-semibold text-[#605e5c]">Task Details</Text>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    {col1.map((col) => renderDefaultField(col))}
                                    {col2.map((col) => renderDefaultField(col))}
                                </div>
                            </div>

                            {/* Tags Section - Full Width */}
                            <div className="mb-6">
                                <Controller
                                    name="tags"
                                    control={control}
                                    render={({ field }) => (
                                        <TagsInput
                                            value={field.value}
                                            onChange={field.onChange}
                                            error={getError("tags")}
                                        />
                                    )}
                                />
                            </div>

                            {/* Custom Fields Section */}
                            {customFields.length > 0 && (
                                <div className="border-t border-[#e0e0e0] pt-5">
                                    <Text className="mb-3 block text-sm font-semibold text-[#605e5c]">Custom Fields</Text>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        {customFields.map((col) => renderCustomField(col))}
                                    </div>
                                </div>
                            )}

                            {sortedColumns.length === 0 && (
                                <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed border-[#c8c6c4]">
                                    <Text className="text-sm text-[#605e5c]">No columns configured yet.</Text>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className={`flex items-center justify-between gap-3 px-6 py-4 ${styles.footer}`}>
                            <div className="flex items-center gap-2 text-sm text-[#605e5c]">
                                {(loading || isSubmitting) && <Spinner size="tiny" />}
                                <span>{mode === "create" ? "Ready to create" : "Ready to update"}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button appearance="secondary" type="button" onClick={onClose}>
                                    Cancel
                                </Button>
                                <Button appearance="primary" type="submit" disabled={loading || isSubmitting}>
                                    {mode === "create" ? "Create" : "Save Changes"}
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </aside>
        </div>
    );
}

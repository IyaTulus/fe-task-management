import { useEffect, useMemo } from "react";
import { useForm, type Resolver } from "react-hook-form";
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
} from "@fluentui/react-components";
import { Dismiss16Regular } from "@fluentui/react-icons";
import type { FormConfig, FormEntry, FormEntryFormValues } from "../../types";

interface TaskFormDrawerProps {
    open: boolean;
    mode: "create" | "edit";
    entry?: FormEntry | null;
    columns: FormConfig[];
    loading?: boolean;
    onClose: () => void;
    onSubmit: (values: FormEntryFormValues) => Promise<void> | void;
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
function buildSchema(columns: FormConfig[]) {
    const shape: Record<string, z.ZodTypeAny> = {};

    for (const col of columns) {
        if (col.type === "email") {
            // Email field: validate email format
            if (col.isRequired) {
                shape[col.name] = z.string().email("Format email tidak valid").min(1, `${col.name} wajib diisi`);
            } else {
                shape[col.name] = z.string().email("Format email tidak valid").optional().or(z.literal("")).default("");
            }
        } else {
            // Text/datetime field
            if (col.isRequired) {
                shape[col.name] = z.string().min(1, `${col.name} wajib diisi`);
            } else {
                shape[col.name] = z.string().optional().or(z.literal("")).default("");
            }
        }
    }

    return z.object({
        values: z.object(shape),
    });
}

// Get default values from entry
function getDefaultValues(entry: FormEntry | null | undefined, columns: FormConfig[]): FormEntryFormValues {
    if (!entry) {
        // Create mode: empty values
        const values: Record<string, string> = {};
        for (const col of columns) {
            values[col.name] = "";
        }
        return { values };
    }

    // Edit mode: use existing values
    return { values: entry.values as Record<string, string> };
}

// Split columns for 2-column layout
function splitColumnsByOrder(columns: FormConfig[]): [FormConfig[], FormConfig[]] {
    const sorted = [...columns].sort((a, b) => a.order - b.order);
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

    const sortedColumns = useMemo(() =>
        [...columns].sort((a, b) => a.order - b.order),
        [columns]
    );

    const schema = useMemo(() => buildSchema(sortedColumns), [sortedColumns]);
    const defaultValues = useMemo(() => getDefaultValues(entry, sortedColumns), [entry, sortedColumns]);

    const [col1, col2] = useMemo(() => splitColumnsByOrder(sortedColumns), [sortedColumns]);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormEntryFormValues>({
        resolver: zodResolver(schema) as Resolver<FormEntryFormValues>,
        defaultValues,
        mode: "onBlur", // Validate on blur, not just on submit
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

    // Render input based on field type
    const renderField = (col: FormConfig) => {
        const fieldName = `values.${col.name}` as const;

        return (
            <Field
                key={col.id}
                label={col.name}
                required={col.isRequired}
                validationState={errors.values?.[col.name] ? "error" : "none"}
                validationMessage={errors.values?.[col.name]?.message as string}
            >
                {col.type === "datetime" ? (
                    <Input
                        type="date"
                        placeholder={`Select ${col.name.toLowerCase()}`}
                        {...register(fieldName)}
                    />
                ) : col.type === "email" ? (
                    <Input
                        type="email"
                        placeholder={`Enter ${col.name.toLowerCase()}`}
                        {...register(fieldName)}
                    />
                ) : (
                    <Input
                        placeholder={`Enter ${col.name.toLowerCase()}`}
                        {...register(fieldName)}
                    />
                )}
            </Field>
        );
    };

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
                aria-label={mode === "create" ? "Create entry" : "Edit entry"}
            >
                <div className={`flex h-full flex-col ${styles.header}`}>
                    {/* Header */}
                    <div className="flex items-center justify-between gap-4 px-6 py-5">
                        <div className="flex flex-col gap-1">
                            <Text className="text-xl font-semibold">
                                {mode === "create" ? "New Entry" : "Edit Entry"}
                            </Text>
                            <Text className="text-sm text-[#605e5c]">
                                {mode === "create"
                                    ? "Create new entry with dynamic fields"
                                    : "Update entry values"}
                            </Text>
                        </div>

                        <Button
                            appearance="subtle"
                            icon={<Dismiss16Regular />}
                            onClick={onClose}
                            aria-label="Close drawer"
                        />
                    </div>

                    {/* Form */}
                    <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleFormSubmit}>
                        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {col1.map(renderField)}
                                {col2.map(renderField)}
                            </div>

                            {sortedColumns.length === 0 && (
                                <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed border-[#c8c6c4]">
                                    <Text className="text-sm text-[#605e5c]">
                                        No columns configured yet.
                                    </Text>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className={`flex items-center justify-between gap-3 px-6 py-4 ${styles.footer}`}>
                            <div className="flex items-center gap-2 text-sm text-[#605e5c]">
                                {(loading || isSubmitting) && <Spinner size="tiny" />}
                                <span>
                                    {mode === "create" ? "Ready to create" : "Ready to update"}
                                </span>
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

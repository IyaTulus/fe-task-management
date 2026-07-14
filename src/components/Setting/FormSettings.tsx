import { useState, useEffect, useCallback } from "react";
import {
    Card,
    Text,
    Button,
    Input,
    Dropdown,
    Option,
    Field,
    Badge,
    Switch,
    Spinner,
    Dialog,
    DialogTrigger,
    DialogSurface,
    DialogTitle,
    DialogBody,
    DialogActions,
    DialogContent,
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableHeaderCell,
    TableRow,
} from "@fluentui/react-components";
import {
    Add16Regular,
    Edit16Regular,
    Delete16Regular,
    ArrowUp16Regular,
    ArrowDown16Regular,
} from "@fluentui/react-icons";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { formService } from "../../services/task.service";
import type { CustomFieldDefinition } from "../../types";

function SortableRow({
    field,
    index,
    onEdit,
    onDelete,
    onToggleActive,
    onMoveUp,
    onMoveDown,
    canMoveUp,
    canMoveDown,
}: {
    field: CustomFieldDefinition;
    index: number;
    onEdit: (field: CustomFieldDefinition) => void;
    onDelete: (field: CustomFieldDefinition) => void;
    onToggleActive: (field: CustomFieldDefinition, isActive: boolean) => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    canMoveUp: boolean;
    canMoveDown: boolean;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: field.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        backgroundColor: isDragging ? "#f5f5f5" : "white",
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case "text":
                return "Text";
            case "email":
                return "Email";
            case "datetime":
                return "Date/Time";
            case "number":
                return "Number";
            case "checkbox":
                return "Checkbox";
            default:
                return type;
        }
    };

    return (
        <TableRow ref={setNodeRef} style={style}>
            {/* Drag Handle */}
            <TableCell className="w-12">
                <button
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing p-1 hover:bg-[#f5f5f5] rounded"
                    aria-label="Drag to reorder"
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="#605e5c">
                        <circle cx="4" cy="4" r="1.5" />
                        <circle cx="12" cy="4" r="1.5" />
                        <circle cx="4" cy="8" r="1.5" />
                        <circle cx="12" cy="8" r="1.5" />
                        <circle cx="4" cy="12" r="1.5" />
                        <circle cx="12" cy="12" r="1.5" />
                    </svg>
                </button>
            </TableCell>

            {/* Order */}
            <TableCell className="w-16 text-center font-medium text-[#605e5c]">{index + 1}</TableCell>

            {/* Label */}
            <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                    <span>{field.label}</span>
                    {field.is_required && (
                        <Badge size="small" appearance="filled" color="important">
                            Required
                        </Badge>
                    )}
                </div>
            </TableCell>

            {/* Type */}
            <TableCell className="w-32">
                <Badge size="small" appearance="outline">
                    {getTypeLabel(field.type)}
                </Badge>
            </TableCell>

            {/* Active Status */}
            <TableCell className="w-32">
                <Switch
                    checked={field.is_active}
                    onChange={(_, checked) => onToggleActive(field, !!checked)}
                    size="small"
                />
                <span className={`ml-2 text-sm ${field.is_active ? "text-green-600" : "text-[#605e5c]"}`}>
                    {field.is_active ? "Active" : "Inactive"}
                </span>
            </TableCell>

            {/* Order Actions */}
            <TableCell className="w-24">
                <div className="flex items-center gap-1">
                    <Button
                        appearance="subtle"
                        icon={<ArrowUp16Regular />}
                        size="small"
                        onClick={onMoveUp}
                        disabled={!canMoveUp}
                        aria-label="Move up"
                    />
                    <Button
                        appearance="subtle"
                        icon={<ArrowDown16Regular />}
                        size="small"
                        onClick={onMoveDown}
                        disabled={!canMoveDown}
                        aria-label="Move down"
                    />
                </div>
            </TableCell>

            {/* Actions */}
            <TableCell className="w-24">
                <div className="flex items-center gap-1">
                    <Button
                        appearance="subtle"
                        icon={<Edit16Regular />}
                        size="small"
                        onClick={() => onEdit(field)}
                        aria-label="Edit field"
                    />
                    <Button
                        appearance="subtle"
                        icon={<Delete16Regular />}
                        size="small"
                        onClick={() => onDelete(field)}
                        aria-label="Delete field"
                    />
                </div>
            </TableCell>
        </TableRow>
    );
}

interface FieldFormData {
    label: string;
    type: "text" | "email" | "datetime" | "number" | "checkbox";
    is_required: boolean;
    is_active: boolean;
}

export default function FormSettings() {
    const [fields, setFields] = useState<CustomFieldDefinition[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingField, setEditingField] = useState<CustomFieldDefinition | null>(null);
    const [formData, setFormData] = useState<FieldFormData>({
        label: "",
        type: "text",
        is_required: false,
        is_active: true,
    });

    // Sensors for drag and drop
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Fetch fields
    const fetchFields = useCallback(async () => {
        setLoading(true);
        try {
            const data = await formService.getFields();
            setFields(data.sort((a, b) => a.formOrder - b.formOrder));
        } catch (err) {
            console.error("Failed to fetch fields:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFields();
    }, []);

    // Handle drag end
    const handleDragEnd = useCallback(
        async (event: DragEndEvent) => {
            const { active, over } = event;

            if (over && active.id !== over.id) {
                setFields((items) => {
                    const oldIndex = items.findIndex((item) => item.id === active.id);
                    const newIndex = items.findIndex((item) => item.id === over.id);
                    const newItems = arrayMove(items, oldIndex, newIndex);

                    // Update order locally
                    const orderedItems = newItems.map((item, index) => ({
                        ...item,
                        formOrder: index + 1,
                    }));

                    // Save new order to API
                    const orderIds = orderedItems.map((item) => item.id);
                    formService.updateFieldOrder(orderIds).catch((err) => {
                        console.error("Failed to update order:", err);
                        fetchFields();
                    });

                    return orderedItems;
                });
            }
        },
        [fetchFields]
    );

    // Open create dialog
    const openCreateDialog = () => {
        setEditingField(null);
        setFormData({
            label: "",
            type: "text",
            is_required: false,
            is_active: true,
        });
        setDialogOpen(true);
    };

    // Open edit dialog
    const openEditDialog = (field: CustomFieldDefinition) => {
        setEditingField(field);
        setFormData({
            label: field.label,
            type: field.type as FieldFormData["type"],
            is_required: field.is_required,
            is_active: field.is_active,
        });
        setDialogOpen(true);
    };

    // Handle submit
    const handleSubmit = async () => {
        if (!formData.label.trim()) return;

        setSaving(true);
        try {
            if (editingField) {
                await formService.updateField(editingField.id, {
                    label: formData.label,
                    type: formData.type,
                    is_required: formData.is_required,
                    is_active: formData.is_active,
                });
            } else {
                await formService.createField({
                    label: formData.label,
                    type: formData.type,
                    is_required: formData.is_required,
                    is_active: formData.is_active,
                });
            }
            setDialogOpen(false);
            await fetchFields();
        } catch (err) {
            console.error("Failed to save field:", err);
        } finally {
            setSaving(false);
        }
    };

    // Handle delete
    const handleDelete = async (field: CustomFieldDefinition) => {
        if (!confirm(`Delete field "${field.label}"?`)) return;

        try {
            await formService.updateField(field.id, { is_active: false });
            await fetchFields();
        } catch (err) {
            console.error("Failed to delete field:", err);
        }
    };

    // Handle toggle active
    const handleToggleActive = async (field: CustomFieldDefinition, isActive: boolean) => {
        try {
            await formService.updateField(field.id, { is_active: isActive });
            setFields((prev) =>
                prev.map((f) => (f.id === field.id ? { ...f, is_active: isActive } : f))
            );
        } catch (err) {
            console.error("Failed to toggle field:", err);
        }
    };

    // Move field up/down
    const moveField = async (index: number, direction: "up" | "down") => {
        const newIndex = direction === "up" ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= fields.length) return;

        const newFields = arrayMove(fields, index, newIndex);
        const orderedItems = newFields.map((item, i) => ({ ...item, formOrder: i + 1 }));

        setFields(orderedItems);

        try {
            const orderIds = orderedItems.map((item) => item.id);
            await formService.updateFieldOrder(orderIds);
        } catch (err) {
            console.error("Failed to update order:", err);
            fetchFields();
        }
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex w-full justify-between items-start">
                <div className="flex flex-col gap-1">
                    <Text className="text-[20px] font-semibold">Custom Form Fields</Text>
                    <Text className="text-sm text-[#605e5c]">
                        Manage custom fields that appear in task forms
                    </Text>
                </div>
                <Button appearance="primary" icon={<Add16Regular />} onClick={openCreateDialog}>
                    Add Field
                </Button>
            </div>

            {/* Field List */}
            <Card className="overflow-hidden">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Spinner label="Loading fields..." />
                    </div>
                ) : fields.length === 0 ? (
                    <div className="text-center py-12 text-[#605e5c]">
                        <Text className="block text-lg mb-2">No custom fields configured</Text>
                        <Text className="block text-sm">Click "Add Field" to create your first custom field.</Text>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHeaderCell className="w-12"></TableHeaderCell>
                                <TableHeaderCell className="w-16">#</TableHeaderCell>
                                <TableHeaderCell>Field Name</TableHeaderCell>
                                <TableHeaderCell className="w-32">Type</TableHeaderCell>
                                <TableHeaderCell className="w-32">Status</TableHeaderCell>
                                <TableHeaderCell className="w-24">Order</TableHeaderCell>
                                <TableHeaderCell className="w-24">Actions</TableHeaderCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={fields.map((f) => f.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {fields.map((field, index) => (
                                        <SortableRow
                                            key={field.id}
                                            field={field}
                                            index={index}
                                            onEdit={openEditDialog}
                                            onDelete={handleDelete}
                                            onToggleActive={handleToggleActive}
                                            onMoveUp={() => moveField(index, "up")}
                                            onMoveDown={() => moveField(index, "down")}
                                            canMoveUp={index > 0}
                                            canMoveDown={index < fields.length - 1}
                                        />
                                    ))}
                                </SortableContext>
                            </DndContext>
                        </TableBody>
                    </Table>
                )}
            </Card>

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={(_, data) => setDialogOpen(data.open)}>
                <DialogSurface>
                    <DialogBody>
                        <DialogTitle>{editingField ? "Edit Field" : "Add New Field"}</DialogTitle>
                        <DialogContent>
                            <div className="flex flex-col gap-4 py-4">
                                {/* Label */}
                                <Field
                                    label="Field Label"
                                    required
                                    validationMessage={!formData.label.trim() ? "Label is required" : undefined}
                                >
                                    <Input
                                        value={formData.label}
                                        onChange={(_, data) =>
                                            setFormData((prev) => ({ ...prev, label: data.value }))
                                        }
                                        placeholder="e.g., Phone, Email, Client Name"
                                    />
                                </Field>

                                {/* Type */}
                                <Field label="Field Type">
                                    <Dropdown
                                        value={formData.type}
                                        onOptionSelect={(_, data) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                type: data.optionValue as FieldFormData["type"],
                                            }))
                                        }
                                    >
                                        <Option value="text">Text</Option>
                                        <Option value="email">Email</Option>
                                        <Option value="datetime">Date/Time</Option>
                                        <Option value="number">Number</Option>
                                        <Option value="checkbox">Checkbox</Option>
                                    </Dropdown>
                                </Field>

                                {/* Options */}
                                <div className="flex flex-col gap-3 pt-2 border-t border-[#e0e0e0]">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Text className="block font-medium">Required Field</Text>
                                            <Text className="block text-xs text-[#605e5c]">
                                                Users must fill this field
                                            </Text>
                                        </div>
                                        <Switch
                                            checked={formData.is_required}
                                            onChange={(_, checked) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    is_required: !!checked,
                                                }))
                                            }
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Text className="block font-medium">Active</Text>
                                            <Text className="block text-xs text-[#605e5c]">
                                                Show this field in the form
                                            </Text>
                                        </div>
                                        <Switch
                                            checked={formData.is_active}
                                            onChange={(_, checked) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    is_active: !!checked,
                                                }))
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </DialogContent>
                        <DialogActions>
                            <Button appearance="secondary" onClick={() => setDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                appearance="primary"
                                onClick={handleSubmit}
                                disabled={saving || !formData.label.trim()}
                            >
                                {saving ? <Spinner size="tiny" /> : editingField ? "Save Changes" : "Add Field"}
                            </Button>
                        </DialogActions>
                    </DialogBody>
                </DialogSurface>
            </Dialog>
        </div>
    );
}

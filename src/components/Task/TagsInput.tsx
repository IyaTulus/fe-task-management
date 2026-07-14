import { useState, useRef } from "react";
import { Input, Button, Tag, TagGroup, Field, Text } from "@fluentui/react-components";
import { Add16Regular, Dismiss12Regular } from "@fluentui/react-icons";

interface TagsInputProps {
    value: string[];
    onChange: (tags: string[]) => void;
    placeholder?: string;
    error?: string;
}

export default function TagsInput({ value = [], onChange, placeholder = "Type and press Enter to add", error }: TagsInputProps) {
    const [inputValue, setInputValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && inputValue.trim()) {
            e.preventDefault();
            addTag(inputValue.trim());
        }
        if (e.key === "," || e.key === " ") {
            e.preventDefault();
            if (inputValue.trim()) {
                addTag(inputValue.trim());
            }
        }
        if (e.key === "Backspace" && !inputValue && value.length > 0) {
            removeTag(value.length - 1);
        }
    };

    const addTag = (tag: string) => {
        // Normalize tag (lowercase, trim)
        const normalizedTag = tag.toLowerCase().trim();
        // Don't add duplicate tags
        if (normalizedTag && !value.includes(normalizedTag)) {
            onChange([...value, normalizedTag]);
        }
        setInputValue("");
    };

    const removeTag = (index: number) => {
        const newTags = [...value];
        newTags.splice(index, 1);
        onChange(newTags);
    };

    const handleBlur = () => {
        if (inputValue.trim()) {
            addTag(inputValue.trim());
        }
    };

    return (
        <Field
            label="Tags"
            validationState={error ? "error" : "none"}
            validationMessage={error}
            hint="Type a tag and press Enter or comma to add"
        >
            <div
                className={`flex flex-wrap items-center gap-2 p-2 border rounded ${
                    error ? "border-[#c42b1c]" : "border-[#e0e0e0]"
                } bg-white min-h-[42px]`}
                onClick={() => inputRef.current?.focus()}
            >
                {/* Existing tags as removable badges */}
                <TagGroup className="flex flex-wrap gap-1">
                    {value.map((tag, index) => (
                        <Tag
                            key={`${tag}-${index}`}
                            size="medium"
                            appearance="filled"
                            dismissible
                            onDismiss={() => removeTag(index)}
                        >
                            {tag}
                        </Tag>
                    ))}
                </TagGroup>

                {/* Input for new tag */}
                <input
                    ref={inputRef as React.RefObject<HTMLInputElement>}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={handleBlur}
                    placeholder={value.length === 0 ? placeholder : ""}
                    className="flex-1 min-w-[120px] border-none outline-none bg-transparent text-sm"
                />
            </div>
        </Field>
    );
}

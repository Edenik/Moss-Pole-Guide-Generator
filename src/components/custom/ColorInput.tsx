import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";

const ColorInput = ({
    label,
    value,
    onChange,
    error,
    debounceTime = 300
}: {
    label: string;
    value?: string;
    onChange: (e: { target: { value: string } }) => void;
    error?: string;
    debounceTime?: number;
}) => {
    const [localValue, setLocalValue] = useState(value);

    // Reset local value when prop value changes
    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    // Debounced onChange handler
    useEffect(() => {
        if (localValue === value) return;

        const timer = setTimeout(() => {
            onChange({ target: { value: localValue! } });
        }, debounceTime);

        return () => clearTimeout(timer);
    }, [localValue, onChange, value, debounceTime]);

    // Handler for text input
    const handleTextChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        let newValue = e.target.value;

        // Ensure the value starts with #
        if (newValue && !newValue.startsWith('#')) {
            newValue = `#${newValue}`;
        }

        // Limit to 7 characters (#RRGGBB)
        if (newValue.length <= 7) {
            setLocalValue(newValue);
        }
    }, []);

    // Handler for color picker
    const handleColorChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalValue(e.target.value);
    }, []);

    return (
        <div className="space-y-1">
            <Label>{label}</Label>
            <div className="flex gap-2">
                <Input
                    type="text"
                    value={localValue}
                    onChange={handleTextChange}
                    className={cn(
                        "font-mono",
                        error && "border-red-500"
                    )}
                    placeholder="#000000"
                />
                <div className="relative">
                    <Input
                        type="color"
                        value={localValue}
                        onChange={handleColorChange}
                        className="w-10 h-10 p-1 cursor-pointer"
                    />
                </div>
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
};

export { ColorInput };


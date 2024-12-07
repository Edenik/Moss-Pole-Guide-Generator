import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripHorizontal, Minus } from "lucide-react";

interface SortableTipProps {
    id: string;
    tip: string;
    index: number;
    onRemove: (index: number) => void;
    onChange: (index: number, value: string) => void;
}

export const SortableTip = ({ id, tip, index, onRemove, onChange }: SortableTipProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 1 : 0,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "flex gap-2 items-center",
                isDragging && "opacity-50"
            )}
        >
            <button
                className="touch-none p-1 hover:bg-accent rounded"
                {...attributes}
                {...listeners}
            >
                <GripHorizontal className="h-4 w-4 text-muted-foreground" />
            </button>
            <Input
                value={tip}
                onChange={(e) => onChange(index, e.target.value)}
            />
            <Button
                variant="outline"
                size="icon"
                onClick={() => onRemove(index)}
            >
                <Minus className="h-4 w-4" />
            </Button>
        </div>
    );
};

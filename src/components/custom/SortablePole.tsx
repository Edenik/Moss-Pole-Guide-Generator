import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { MossPole } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripHorizontal, Minus } from "lucide-react";
import { CollapsibleSection } from "./CollapsibleSection";
import { ColorInput } from "./ColorInput";

export interface SortablePoleProps {
    id: string;
    pole: MossPole;
    index: number;
    validationErrors: { [key: string]: string };
    onChange: (index: number, field: keyof MossPole, value: any) => void;
    onRemove: () => void;
    canRemove: boolean;
}

export const SortablePole = ({
    id,
    pole,
    index,
    validationErrors,
    onChange,
    onRemove,
    canRemove
}: SortablePoleProps) => {
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
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn("border rounded-lg p-4", isDragging && "opacity-50")}
        >
            <div className="flex items-center gap-2">
                <button
                    className="touch-none p-1 hover:bg-accent rounded"
                    {...attributes}
                    {...listeners}
                >
                    <GripHorizontal className="h-4 w-4 text-muted-foreground" />
                </button>
                <CollapsibleSection border={false} title={`${pole.name} (Pole ${index + 1})`}>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label>Plant Name *</Label>
                                <Input
                                    value={pole.name}
                                    onChange={(e) => onChange(index, 'name', e.target.value)}
                                    className={cn(validationErrors[`pole${index}-name`] && "border-red-500")}
                                />
                                {validationErrors[`pole${index}-name`] && (
                                    <p className="text-xs text-red-500">{validationErrors[`pole${index}-name`]}</p>
                                )}
                            </div>
                            <ColorInput
                                label="Pot Color"
                                value={pole.potColor}
                                onChange={(e: any) => onChange(index, 'potColor', e.target.value)}
                                error={validationErrors[`pole${index}-potColor`]}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {['Top', 'Middle', 'Bottom'].map((pos) => (
                                <div key={pos} className="space-y-1">
                                    <Label>{pos} Humidity *</Label>
                                    <Input
                                        value={pole[`humidity${pos}` as keyof MossPole] as string}
                                        onChange={(e) => onChange(index, `humidity${pos}` as keyof MossPole, e.target.value)}
                                        className={cn(validationErrors[`pole${index}-humidity${pos}`] && "border-red-500")}
                                        placeholder="XX-XX"
                                    />
                                    {validationErrors[`pole${index}-humidity${pos}`] && (
                                        <p className="text-xs text-red-500">{validationErrors[`pole${index}-humidity${pos}`]}</p>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Switch
                                    checked={pole.displaySensorPlace}
                                    onCheckedChange={(checked) => onChange(index, 'displaySensorPlace', checked)}
                                />
                                <Label>Show Sensor Placement</Label>
                            </div>
                            {canRemove && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={onRemove}
                                >
                                    <Minus className="h-4 w-4 mr-2" /> Remove Pole
                                </Button>
                            )}
                        </div>
                    </div>
                </CollapsibleSection>
            </div>
        </div>
    );
};

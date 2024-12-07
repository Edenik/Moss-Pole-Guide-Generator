
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Config } from "@/lib/types";
import {
    closestCenter,
    DndContext,
    DragEndEvent,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus } from "lucide-react";
import { CollapsibleSection } from './CollapsibleSection';
import { SortableTip } from './SortableTip';

interface TipsSectionProps {
    config: Config;
    onConfigChange: (field: keyof Config, value: any) => void;
}

export const TipsSection = ({ config, onConfigChange }: TipsSectionProps) => {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        const oldIndex = parseInt(active.id.toString().split('-')[1]);
        const newIndex = parseInt(over.id.toString().split('-')[1]);

        if (oldIndex !== newIndex) {
            const newTips = arrayMove(config.careTips.tips || [], oldIndex, newIndex);
            onConfigChange('careTips', {
                ...config.careTips,
                tips: newTips
            });
        }
    };

    return (
        <CollapsibleSection title="Care Tips" >
            <div className="space-y-4" >
                <div className="flex items-center justify-between" >
                    <Label>Show Care Tips </Label>
                    < Switch
                        checked={config.careTips.enabled}
                        onCheckedChange={(checked) => onConfigChange('careTips', {
                            ...config.careTips,
                            enabled: checked
                        })}
                    />
                </div>

                {
                    config.careTips.enabled && (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={(config.careTips.tips || []).map((_, i) => `tip-${i}`)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="space-y-2" >
                                    {
                                        config.careTips.tips?.map((tip, i) => (
                                            <SortableTip
                                                key={`tip-${i}`}
                                                id={`tip-${i}`
                                                }
                                                tip={tip}
                                                index={i}
                                                onChange={(index, value) => {
                                                    const newTips = [...(config.careTips.tips || [])];
                                                    newTips[index] = value;
                                                    onConfigChange('careTips', {
                                                        ...config.careTips,
                                                        tips: newTips
                                                    });
                                                }}
                                                onRemove={(index) => {
                                                    const newTips = config.careTips.tips?.filter((_, idx) => idx !== index);
                                                    onConfigChange('careTips', {
                                                        ...config.careTips,
                                                        tips: newTips
                                                    });
                                                }}
                                            />
                                        ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    )}

                {
                    config.careTips.enabled && (
                        <Button
                            variant="outline"
                            onClick={() => {
                                const newTips = [...(config.careTips.tips || []), "New tip"];
                                onConfigChange('careTips', {
                                    ...config.careTips,
                                    tips: newTips
                                });
                            }
                            }
                        >
                            <Plus className="h-4 w-4 mr-2" /> Add Tip
                        </Button>
                    )}
            </div>
        </CollapsibleSection>
    );
};
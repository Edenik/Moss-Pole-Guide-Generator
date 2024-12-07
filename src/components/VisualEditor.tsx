// VisualEditor.tsx
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Config, MossPole, MossPolesData } from "@/lib/types";
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
import { AlertCircle, Plus } from "lucide-react";
import React from 'react';
import { CollapsibleSection } from "./ui/CollapsibleSection";
import { ColorInput } from "./ui/ColorInput";
import { SortablePole } from "./ui/SortablePole";
import { SortableTip } from "./ui/SortableTip";

interface VisualEditorProps {
    data: MossPolesData;
    onChange: (data: MossPolesData) => void;
    onValidationError: (hasError: boolean) => void;
}

const VisualEditor = ({
    data,
    onChange,
    onValidationError
}: VisualEditorProps) => {
    const [validationErrors, setValidationErrors] = React.useState<{ [key: string]: string }>({});

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Validation functions
    const validateHumidity = (value: string) => {
        const regex = /^\d{2}-\d{2}$/;
        if (!regex.test(value)) return "Format should be XX-XX";
        const [min, max] = value.split('-').map(Number);
        if (min > max) return "Min should be less than max";
        if (min < 0 || max > 100) return "Values should be 0-100";
        return "";
    };

    const validateColor = (value: string) => {
        const regex = /^#[0-9A-Fa-f]{6}$/;
        if (!regex.test(value)) return "Invalid hex color";
        return "";
    };

    const validateField = (name: string, value: string) => {
        switch (name) {
            case 'humidityTop':
            case 'humidityMiddle':
            case 'humidityBottom':
                return validateHumidity(value);
            case 'potColor':
            case 'backgroundColor':
            case 'textColor':
                return validateColor(value);
            default:
                if (isNaN((value as any) as number)) {
                    return value.trim() ? "" : "Required";
                }
                return value
        }
    };

    const handleConfigChange = (field: keyof Config, value: any) => {
        onChange({
            ...data,
            config: { ...data.config, [field]: value }
        });
    };

    const handleVisualConfigChange = (field: string, value: string) => {
        const error = validateField(field, value);
        setValidationErrors(prev => ({ ...prev, [field]: error }));
        onChange({
            ...data,
            config: {
                ...data.config,
                visual: { ...data.config.visual, [field]: value }
            }
        });
    };

    const handlePoleChange = (index: number, field: keyof MossPole, value: any) => {
        const error = field === 'name' || field.startsWith('humidity') ?
            validateField(field.toString(), value) : '';
        setValidationErrors(prev => ({ ...prev, [`pole${index}-${field}`]: error }));

        const newPoles = [...data.poles];
        newPoles[index] = { ...newPoles[index], [field]: value };
        onChange({ ...data, poles: newPoles });
    };

    const handleTipsDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        const oldIndex = parseInt(active.id.toString().split('-')[1]);
        const newIndex = parseInt(over.id.toString().split('-')[1]);

        if (oldIndex !== newIndex) {
            const newTips = arrayMove(data.config.careTips.tips || [], oldIndex, newIndex);
            handleConfigChange('careTips', {
                ...data.config.careTips,
                tips: newTips
            });
        }
    };

    const handlePolesDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        const oldIndex = parseInt(active.id.toString().split('-')[1]);
        const newIndex = parseInt(over.id.toString().split('-')[1]);

        if (oldIndex !== newIndex) {
            const newPoles = arrayMove(data.poles, oldIndex, newIndex);
            onChange({ ...data, poles: newPoles });
        }
    };

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <CollapsibleSection title="Visual Settings">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ColorInput
                                label="Background Color"
                                value={data.config.visual.backgroundColor}
                                onChange={(e: any) => handleVisualConfigChange('backgroundColor', e.target.value)}
                                error={validationErrors['backgroundColor']}
                            />
                            <ColorInput
                                label="Text Color"
                                value={data.config.visual.textColor}
                                onChange={(e: any) => handleVisualConfigChange('textColor', e.target.value)}
                                error={validationErrors['textColor']}
                            />
                            <Input
                                // label="Algae %"
                                type="number"
                                min="0"
                                max="100"
                                value={data.config.visual.algaePercentage}
                                onChange={(e: any) => handleVisualConfigChange('algaePercentage', e.target.value)}
                            />
                        </div>
                    </CollapsibleSection>

                    {data.config.careTips.enabled && (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleTipsDragEnd}
                        >
                            <SortableContext
                                items={(data.config.careTips.tips || []).map((_, i) => `tip-${i}`)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="space-y-2">
                                    {data.config.careTips.tips?.map((tip, i) => (
                                        <SortableTip
                                            key={`tip-${i}`}
                                            id={`tip-${i}`}
                                            tip={tip}
                                            index={i}
                                            onChange={(index: number, value: string) => {
                                                const newTips = [...(data.config.careTips.tips || [])];
                                                newTips[index] = value;
                                                handleConfigChange('careTips', {
                                                    ...data.config.careTips,
                                                    tips: newTips
                                                });
                                            }}
                                            onRemove={(index: number) => {
                                                const newTips = data.config.careTips.tips?.filter((_, idx) => idx !== index);
                                                handleConfigChange('careTips', {
                                                    ...data.config.careTips,
                                                    tips: newTips
                                                });
                                            }}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Moss Poles</CardTitle>
                    <Button
                        variant="outline"
                        onClick={() => {
                            const newPole: MossPole = {
                                name: "New Plant",
                                humidityTop: "70-80",
                                humidityMiddle: "65-75",
                                humidityBottom: "60-70",
                                potColor: "#cccccc",
                                displaySensorPlace: false
                            };
                            onChange({ ...data, poles: [...data.poles, newPole] });
                        }}
                    >
                        <Plus className="h-4 w-4 mr-2" /> Add Pole
                    </Button>
                </CardHeader>
                <CardContent>
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handlePolesDragEnd}
                    >
                        <SortableContext
                            items={data.poles.map((_, i) => `pole-${i}`)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-4">
                                {data.poles.map((pole, index) => (
                                    <SortablePole
                                        key={`pole-${index}`}
                                        id={`pole-${index}`}
                                        pole={pole}
                                        index={index}
                                        validationErrors={validationErrors}
                                        onChange={handlePoleChange}
                                        onRemove={() => {
                                            const newPoles = data.poles.filter((_, i) => i !== index);
                                            onChange({ ...data, poles: newPoles });
                                        }}
                                        canRemove={data.poles.length > 1}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                </CardContent>
            </Card>

            {Object.values(validationErrors).some(error => error) && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Please fix the validation errors before saving
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
};

export default VisualEditor;
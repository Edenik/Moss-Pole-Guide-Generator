import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Config } from "@/lib/types";
import { CollapsibleSection } from './CollapsibleSection';
import { ColorInput } from "./colorInput";

interface VisualSettingsProps {
    config: Config;
    onVisualConfigChange: (field: string, value: string) => void;
    validationErrors: { [key: string]: string };
}

export const VisualSettings = ({
    config,
    onVisualConfigChange,
    validationErrors
}: VisualSettingsProps) => {
    return (
        <CollapsibleSection title="Visual Settings" >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" >
                <ColorInput
                    label="Background Color"
                    value={config.visual.backgroundColor}
                    onChange={(e: any) => onVisualConfigChange('backgroundColor', e.target.value)}
                    error={validationErrors['backgroundColor']}
                />
                <ColorInput
                    label="Text Color"
                    value={config.visual.textColor}
                    onChange={(e: any) => onVisualConfigChange('textColor', e.target.value)}
                    error={validationErrors['textColor']}
                />
                <div className="space-y-1" >
                    <Label>Algae % </Label>
                    < Input
                        type="number"
                        min="0"
                        max="100"
                        value={config.visual.algaePercentage}
                        onChange={(e) => onVisualConfigChange('algaePercentage', e.target.value)}
                    />
                </div>
            </div>
        </CollapsibleSection>
    );
};

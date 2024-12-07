import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/drop-down-menu";
import { mossPolesExamples } from '@/lib/examples';
import { BookOpen, ChevronDown } from "lucide-react";
import { toast } from "react-hot-toast";

interface ExamplesDropdownProps {
    onSelect: (jsonData: string) => void;
}

const ExamplesDropdown = ({ onSelect }: ExamplesDropdownProps) => {
    const handleSelect = (exampleName: string) => {
        try {
            const selectedExample = mossPolesExamples[exampleName];
            onSelect(JSON.stringify(selectedExample, null, 2));
            toast.success(`Loaded "${exampleName}" configuration`);
        } catch (error) {
            toast.error("Failed to load example configuration");
            console.error(error);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <BookOpen className="h-4 w-4" />
                    Examples
                    <ChevronDown className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-[300px] overflow-y-auto">
                {Object.keys(mossPolesExamples).map((exampleName) => (
                    <DropdownMenuItem
                        key={exampleName}
                        onClick={() => handleSelect(exampleName)}
                    >
                        {exampleName}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default ExamplesDropdown;
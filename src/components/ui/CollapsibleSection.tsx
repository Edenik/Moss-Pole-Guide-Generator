import { ChevronDown, ChevronRight } from "lucide-react";
import React from 'react';

interface CollapsibleSectionProps {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

export const CollapsibleSection = ({
    title,
    children,
    defaultOpen = false
}: CollapsibleSectionProps) => {
    const [isOpen, setIsOpen] = React.useState(defaultOpen);

    return (
        <div className="w-full" >
            <button
                className="flex items-center justify-between w-full text-left"
                onClick={() => setIsOpen(!isOpen)}
            >
                <h3 className="font-medium" > {title} </h3>
                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
            {isOpen && <div className="mt-4" > {children} </div>}
        </div>
    );
};


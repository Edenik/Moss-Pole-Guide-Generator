// lib/file-import.ts

import { toast } from "react-hot-toast";
import { MossPolesSchema } from "./validation";

export const importFile = (file: File): Promise<{ json: string; yaml: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async (event) => {
            try {
                const content = event.target?.result as string;
                const fileExtension = file.name.split('.').pop()?.toLowerCase();

                let parsedData;
                // Parse based on file type
                try {
                    if (fileExtension === 'json') {
                        parsedData = JSON.parse(content);
                    } else {
                        toast.error('Unsupported file format. Please use JSON or YAML files.');
                        reject(new Error('Unsupported file format'));
                        return;
                    }
                } catch (parseError) {
                    toast.error(`Error parsing ${fileExtension?.toUpperCase()} file. Please check the file format.`);
                    reject(parseError);
                    return;
                }

                // Validate the parsed data structure
                const validationResult = MossPolesSchema.safeParse(parsedData);

                if (!validationResult.success) {
                    const errorMessage = validationResult.error.errors[0]?.message || 'Invalid file structure';
                    toast.error(`Validation error: ${errorMessage}`);
                    console.error('Validation failed:', validationResult.error);
                    reject(new Error(errorMessage));
                    return;
                }

                // Generate both formats from the validated data
                const jsonString = JSON.stringify(validationResult.data, null, 2);

                resolve({
                    json: jsonString,
                    yaml: jsonString
                });

                toast.success('File imported successfully!');
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error during import';
                console.error('Import error:', error);
                toast.error(`Import failed: ${errorMessage}`);
                reject(error);
            }
        };

        reader.onerror = () => {
            toast.error('Error reading file');
            reject(new Error('Error reading file'));
        };

        reader.readAsText(file);
    });
};
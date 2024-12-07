"use client"
import CodeEditor from "@/components/custom/CodeEditor";
import VisualEditor from "@/components/custom/VisualEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/drop-down-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { defaultInput } from "@/lib/constants";
import { downloadJPG, downloadJSON, downloadPDF, downloadPNG, downloadSVG, downloadYAML, print } from "@/lib/helpers";
import { generateMossPole } from "@/lib/svg_generator";
import { InputType, MossPolesData } from "@/lib/types";
import { MossPolesSchema } from "@/lib/validation";
import { ChevronDown, Download, Eraser, Github, Moon, Printer, RefreshCw, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from 'react';
import { toast } from "react-hot-toast";
import { parse, stringify } from "yaml";

const MossPoleGenerator = () => {
  const [editorMode, setEditorMode] = useState<'visual' | 'json' | 'yaml'>('visual');
  const [input, setInput] = useState(defaultInput);
  const [isValid, setIsValid] = useState(true);
  const [imageOutput, setImageOutput] = useState<string>("");
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [visualEditorHasError, setVisualEditorHasError] = useState(false);

  useEffect(() => {
    generateSVG(defaultInput.json, 'json', true);
    setMounted(true);
  }, []);

  const validateInput = (value: string, type: 'json' | 'yaml'): boolean => {
    try {
      const parsedData = type === 'json' ? JSON.parse(value) : parse(value);
      const result = MossPolesSchema.safeParse(parsedData);

      if (!result.success) {
        setValidationError(result.error.errors[0]?.message || "Invalid format");
        return false;
      }

      setValidationError(null);
      return true;
    } catch (error) {
      setValidationError("Invalid syntax");
      return false;
    }
  };

  const handleInputChange = (value: string) => {
    const inputType = editorMode as 'json' | 'yaml';
    setInput((prev) => ({
      ...prev,
      [inputType]: value,
    }));

    const timeoutId = setTimeout(() => {
      const valid = validateInput(value, inputType);
      setIsValid(valid);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const handleVisualEditorChange = (data: MossPolesData) => {
    const jsonStr = JSON.stringify(data, null, 2);
    setInput({
      json: jsonStr,
      yaml: stringify(data)
    });
  };

  const syncFormats = (value: string, fromType: 'json' | 'yaml') => {
    try {
      const parsedData = fromType === 'json' ? JSON.parse(value) : parse(value);
      setInput({
        json: JSON.stringify(parsedData, null, 2),
        yaml: stringify(parsedData),
      });
    } catch (error) {
      setInput((prev) => ({
        ...prev,
        [fromType]: value,
      }));
    }
  };

  const handleTabChange = (newMode: string) => {
    setEditorMode(newMode as 'visual' | 'json' | 'yaml');
    if (newMode !== 'visual') {
      syncFormats(input[newMode as 'json' | 'yaml'], newMode as 'json' | 'yaml');
    }
  };

  const generateSVG = (value: string, type: 'json' | 'yaml', init: boolean = false) => {
    try {
      const data = type === 'json' ? JSON.parse(value) : parse(value);
      const result = MossPolesSchema.safeParse(data);

      if (!result.success) {
        toast.error("Invalid input format. Please check your data structure.");
        return;
      }

      const svg = generateMossPole(result.data);
      setImageOutput(svg);
      if (!init) {
        toast.success("Image generated successfully!");
      }
    } catch (error) {
      toast.error("Error generating Image. Please check your input.");
      console.error("Generation error:", error);
    }
  };

  const handleReset = () => {
    setInput(defaultInput);
    setIsValid(true);
    setValidationError(null);
    setImageOutput("");
    generateSVG(defaultInput.json, 'json', true);
    toast.success("Reset to default configuration");
  };

  const handleRegenerate = () => {
    if (isValid) {
      generateSVG(input[editorMode === 'visual' ? 'json' : editorMode], editorMode === 'visual' ? 'json' : editorMode);
    } else {
      toast.error("Invalid input format. Please check your data structure.");
    }
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen p-4 md:p-8 bg-background">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold tracking-tight">
            Moss Pole Guide Generator
          </h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              title="Dark / Light Mode"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => window.open("https://github.com/Edenik/Moss-Pole-Guide-Generator", "_blank")}
              title="GitHub Repository"
            >
              <Github className="h-5 w-5" />
            </Button>


          </div>
        </div>

        {imageOutput && (
          <Card>
            <CardContent className="p-6">
              <div
                className="w-full overflow-auto bg-white dark:bg-gray-800 rounded-lg"
                dangerouslySetInnerHTML={{ __html: imageOutput }}
              />
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 sm:gap-4 sm:justify-center">
          <Button
            onClick={handleReset}
            variant="outline"
            title="Reset to default"
          >
            <Eraser className="h-5 w-5" />
            Reset To Default
          </Button>
          <Button
            onClick={handleRegenerate}
            className="gap-2"
            variant="outline"
            disabled={!isValid || visualEditorHasError}>
            <RefreshCw className="h-4 w-4" />
            Regenerate
          </Button>
          <Button
            onClick={print.bind(null, imageOutput)}
            className="gap-2"
            variant="outline"
            disabled={!imageOutput}>
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto" disabled={!imageOutput}>
                <Download className="h-4 w-4 mr-2" />
                Download
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => downloadPNG(imageOutput)}>
                PNG
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => downloadJPG(imageOutput)}>
                JPG
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => downloadSVG(imageOutput)}>
                SVG
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => downloadPDF(imageOutput)}>
                PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => downloadJSON(input.json)}>
                JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => downloadYAML(input.yaml)}>
                YAML
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Card>
          <Tabs defaultValue="visual" onValueChange={handleTabChange}>
            <TabsList className="w-full justify-start">
              <TabsTrigger value="visual">Visual Editor</TabsTrigger>
              <TabsTrigger value="json">JSON</TabsTrigger>
              <TabsTrigger value="yaml">YAML</TabsTrigger>
            </TabsList>
            <CardContent className="p-6">
              {editorMode === 'visual' ? (
                <VisualEditor
                  data={JSON.parse(input.json)}
                  onChange={handleVisualEditorChange}
                  onValidationError={setVisualEditorHasError}
                />
              ) : (
                <CodeEditor
                  value={input[editorMode]}
                  onChange={handleInputChange}
                  language={editorMode === 'json' ? InputType.json : InputType.yaml}
                  isValid={isValid}
                  validationError={validationError}
                  theme={theme as 'light' | 'dark'}
                />
              )}
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </main>
  );
};

export default MossPoleGenerator;
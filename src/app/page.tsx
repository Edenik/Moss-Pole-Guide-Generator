"use client"
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { defaultInput } from "@/lib/constants";
import { downloadSVG, printSVG } from "@/lib/helpers";
import { generateMossPole } from "@/lib/svg_generator";
import { InputType } from "@/lib/types";
import { MossPolesSchema } from "@/lib/validation";
import { Download, Github, Moon, Printer, RefreshCw, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { parse, stringify } from "yaml";

const MossPoleGenerator = () => {
  const [inputType, setInputType] = useState<InputType>(InputType.json);
  const [input, setInput] = useState(defaultInput);
  const [isValid, setIsValid] = useState(true);
  const [svgOutput, setSvgOutput] = useState<string>("");
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    generateSVG(defaultInput[inputType], inputType, true);
    setMounted(true);
  }, []);

  const validateInput = (value: string, type: InputType): boolean => {
    try {
      const parsedData = type === InputType.json ? JSON.parse(value) : parse(value);
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
    setInput((prev) => ({
      ...prev,
      [inputType]: value,
    }));

    // Debounce validation to avoid excessive checking
    const timeoutId = setTimeout(() => {
      const valid = validateInput(value, inputType);
      setIsValid(valid);
      if (valid) {
        generateSVG(value, inputType);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const syncFormats = (value: string, fromType: InputType) => {
    try {
      const parsedData = fromType === InputType.json ? JSON.parse(value) : parse(value);

      setInput({
        json: JSON.stringify(parsedData, null, 2),
        yaml: stringify(parsedData),
      });
    } catch (error) {
      // If parsing fails, just update the current format
      setInput((prev) => ({
        ...prev,
        [fromType]: value,
      }));
    }
  };

  const handleTabChange = (newType: string) => {
    setInputType(newType as InputType);
    syncFormats(input[inputType], inputType);
  };

  const generateSVG = (value: string, type: InputType, init: boolean = false) => {
    try {
      const data = type === InputType.json ? JSON.parse(value) : parse(value);
      const result = MossPolesSchema.safeParse(data);

      if (!result.success) {
        toast.error("Invalid input format. Please check your data structure.");
        return;
      }

      const svg = generateMossPole(result.data);
      setSvgOutput(svg);
      if (!init) {
        toast.success("SVG generated successfully!");
      }
    } catch (error) {
      toast.error("Error generating SVG. Please check your input.");
      console.error("Generation error:", error);
    }
  };

  const handleDownload = () => {
    downloadSVG(svgOutput);
  };

  const handlePrint = () => {
    printSVG(svgOutput);
  };

  const handleReset = () => {
    setInput(defaultInput);
    setIsValid(true);
    setValidationError(null);
    setSvgOutput("");
    generateSVG(defaultInput[inputType], inputType, true);
    toast.success("Reset to default configuration");
  };

  const handleRegenerate = () => {
    if (isValid) {
      generateSVG(input[inputType], inputType);
    } else {
      toast.error("Invalid input format. Please check your data structure.");
    }
  };

  if (!mounted) {
    return null;
  }

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
              onClick={handleReset}
              title="Reset to default"
            >
              <RefreshCw className="h-5 w-5" />
            </Button>
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

        <Card>
          <Tabs defaultValue={inputType} onValueChange={handleTabChange}>
            <TabsList className="w-full justify-start">
              <TabsTrigger value={InputType.json}>JSON</TabsTrigger>
              <TabsTrigger value={InputType.yaml}>YAML</TabsTrigger>
            </TabsList>
            <CardContent className="p-6 space-y-2">
              <Textarea
                value={input[inputType]}
                onChange={(e) => handleInputChange(e.target.value)}
                className={`font-mono min-h-[300px] ${!isValid ? "border-red-500 dark:border-red-400" : ""}`}
                placeholder={`Enter your ${inputType.toUpperCase()} data here...`}
              />
              {validationError && (
                <p className="text-sm text-red-500 dark:text-red-400">
                  {validationError}
                </p>
              )}
            </CardContent>
          </Tabs>
        </Card>

        {svgOutput && (
          <Card>
            <CardContent className="p-6">
              <div
                className="w-full overflow-auto bg-white dark:bg-gray-800 rounded-lg"
                dangerouslySetInnerHTML={{ __html: svgOutput }}
              />
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={handleRegenerate}
            className="gap-2"
            disabled={!isValid}
          >
            <RefreshCw className="h-4 w-4" />
            Regenerate
          </Button>
          <Button
            onClick={handleDownload}
            className="gap-2"
            disabled={!svgOutput}
          >
            <Download className="h-4 w-4" />
            Download SVG
          </Button>
          <Button
            onClick={handlePrint}
            className="gap-2"
            disabled={!svgOutput}
          >
            <Printer className="h-4 w-4" />
            Print SVG
          </Button>
        </div>
      </div>
    </main>
  );
};

export default MossPoleGenerator;

import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useState } from "react";

interface FileUploadProps {
  onFileLoaded: (data: string) => void;
}

export const FileUpload = ({ onFileLoaded }: FileUploadProps) => {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      onFileLoaded(text);
      toast({
        title: "File loaded successfully",
        description: "Your CSV data has been processed",
      });
    };
    reader.readAsText(file);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    handleFile(file);
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div
          className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{ borderColor: isDragging ? 'hsl(var(--primary))' : undefined }}
        >
          <Upload className="w-12 h-12 mb-4 text-gray-400" />
          <p className="mb-2 text-sm text-muted-foreground">
            {isDragging ? "Drop your CSV file here" : "Select your CSV file"}
          </p>
          <input
            id="file-upload"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button asChild>
            <label htmlFor="file-upload" className="cursor-pointer">
              Choose File
            </label>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
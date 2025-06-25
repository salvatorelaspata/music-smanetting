"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onFilesUploaded: (files: File[], imageUrls: string[]) => void;
  onViewUploaded: () => void;
  uploadedCount: number;
}

export function FileUpload({ onFilesUploaded, onViewUploaded, uploadedCount }: FileUploadProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    processFiles(Array.from(files));
  };

  // Process files (both upload and drag/drop)
  const processFiles = (files: File[]) => {
    const validFiles: File[] = [];
    const fileReaders: FileReader[] = [];
    const newImageUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Check file type for drag/drop (upload input already has accept attribute)
      if (!file.type.match('image.*') && file.type !== 'application/pdf') {
        continue; // Skip non-image, non-PDF files
      }

      validFiles.push(file);
      const reader = new FileReader();
      fileReaders.push(reader);

      reader.onload = (e) => {
        if (e.target?.result) {
          newImageUrls.push(e.target.result as string);

          // If we've processed all valid files, update state
          if (newImageUrls.length === validFiles.length) {
            onFilesUploaded(validFiles, newImageUrls);
          }
        }
      };

      reader.readAsDataURL(file);
    }

    if (validFiles.length === 0) {
      toast({
        title: "Invalid files",
        description: "Please upload image or PDF files.",
        variant: "destructive",
      });
    }
  };

  // Handle drag events
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
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

    const files = e.dataTransfer.files;
    if (files.length === 0) return;

    processFiles(Array.from(files));
  };

  return (
    <TabsContent value="upload" className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-md p-10 text-center cursor-pointer transition-colors ${isDragging ? "bg-primary/10 border-primary" : "hover:bg-muted/50"
          }`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className={`h-10 w-10 mb-2 mx-auto ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
        <p className="text-lg font-semibold">
          {isDragging ? "Drop your files here" : "Drop your images here or click to browse"}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Supports multiple JPG, PNG and PDF files
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          onChange={handleFileUpload}
          multiple
        />
      </div>

      {uploadedCount > 0 && (
        <Button
          className="w-full"
          variant="secondary"
          onClick={onViewUploaded}
        >
          View {uploadedCount} Selected Images
        </Button>
      )}
    </TabsContent>
  );
}

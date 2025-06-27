"use client";

import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { AlertCircle, Loader2, Plus, Trash, X, MoveLeft, MoveRight } from "lucide-react";
import Image from "next/image";

interface ImagePreviewProps {
  imageUrls: string[];
  currentPreviewIndex: number;
  onPreviewIndexChange: (index: number) => void;
  onRemovePage: (index: number) => void;
  onMovePageLeft: (index: number) => void;
  onMovePageRight: (index: number) => void;
  onAddMorePages: () => void;
  onClearAll: () => void;
  onProcess: () => void;
  processingStatus: "idle" | "processing" | "success" | "error";
}

export function ImagePreview({
  imageUrls,
  currentPreviewIndex,
  onPreviewIndexChange,
  onRemovePage,
  onMovePageLeft,
  onMovePageRight,
  onAddMorePages,
  onClearAll,
  onProcess,
  processingStatus
}: ImagePreviewProps) {

  if (imageUrls.length === 0) {
    return (
      <TabsContent value="preview" className="space-y-4">
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-medium mb-2">No Pages Selected</h3>
          <p className="text-muted-foreground mb-4">
            Please upload or capture at least one page
          </p>
          <Button onClick={() => onAddMorePages()}>
            Upload Images
          </Button>
        </div>
      </TabsContent>
    );
  }

  return (
    <TabsContent value="preview" className="space-y-4">
      <div className="space-y-6">
        {/* Current image preview */}
        <div className="relative w-full overflow-hidden rounded-md border">
          {/* <img
            src={imageUrls[currentPreviewIndex]}
            alt={`Sheet music page ${currentPreviewIndex + 1}`}
            className="w-full h-auto object-contain"
          /> */}
          <Image
            src={imageUrls[currentPreviewIndex]}
            alt={`Sheet music page ${currentPreviewIndex + 1}`}
            className="w-full h-auto object-contain"
          />
          <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-sm">
            Page {currentPreviewIndex + 1} of {imageUrls.length}
          </div>
        </div>

        {/* Pagination for multiple pages */}
        {imageUrls.length > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPreviewIndex > 0) {
                      onPreviewIndexChange(currentPreviewIndex - 1);
                    }
                  }}
                  aria-disabled={currentPreviewIndex === 0}
                />
              </PaginationItem>

              {imageUrls.map((_, index) => (
                <PaginationItem key={index}>
                  <PaginationLink
                    href="#"
                    isActive={index === currentPreviewIndex}
                    onClick={(e) => {
                      e.preventDefault();
                      onPreviewIndexChange(index);
                    }}
                  >
                    {index + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPreviewIndex < imageUrls.length - 1) {
                      onPreviewIndexChange(currentPreviewIndex + 1);
                    }
                  }}
                  aria-disabled={currentPreviewIndex === imageUrls.length - 1}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}

        {/* Page management controls */}
        <div className="flex flex-wrap gap-2 justify-center">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onMovePageLeft(currentPreviewIndex)}
            disabled={currentPreviewIndex === 0}
          >
            <MoveLeft className="h-4 w-4 mr-1" />
            Move Left
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => onRemovePage(currentPreviewIndex)}
            className="text-red-500 hover:bg-red-500/10"
          >
            <Trash className="h-4 w-4 mr-1" />
            Remove Page
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => onMovePageRight(currentPreviewIndex)}
            disabled={currentPreviewIndex === imageUrls.length - 1}
          >
            <MoveRight className="h-4 w-4 mr-1" />
            Move Right
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={onAddMorePages}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add More Pages
          </Button>
        </div>

        {/* Process button */}
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={onClearAll}
          >
            <X className="mr-2 h-4 w-4" />
            Clear All
          </Button>

          <Button
            onClick={onProcess}
            disabled={processingStatus === "processing"}
          >
            {processingStatus === "processing" && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Process {imageUrls.length} {imageUrls.length === 1 ? "Page" : "Pages"}
          </Button>
        </div>
      </div>
    </TabsContent>
  );
}

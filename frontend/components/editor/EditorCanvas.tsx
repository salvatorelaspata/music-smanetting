import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  PenLine,
  Info,
  ZoomIn,
  ZoomOut,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { SheetMusic, SheetMusicPage } from "@/lib/store/useSheetMusicStore";
import { AnnotationOverlay } from "./AnnotationOverlay";
import { AnnotationInput } from "./AnnotationInput";

interface EditorCanvasProps {
  sheetMusic: SheetMusic;
  currentPage: SheetMusicPage | undefined;
  zoom: number;
  tool: "select" | "annotate";
  showPageSidebar: boolean;
  showAnnotationSidebar: boolean;
  showAnnotationInput: boolean;
  annotationText: string;
  annotationPosition: { x: number; y: number };
  imageRef: React.RefObject<HTMLImageElement>;
  containerRef: React.RefObject<HTMLDivElement>;
  onToolChange: (tool: "select" | "annotate") => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  onImageClick: (e: React.MouseEvent<HTMLImageElement>) => void;
  onAnnotationTextChange: (text: string) => void;
  onSaveAnnotation: () => void;
  onCancelAnnotation: () => void;
  onDeleteAnnotation: (pageId: string, annotationId: string) => void;
}

export function EditorCanvas({
  sheetMusic,
  currentPage,
  zoom,
  tool,
  showPageSidebar,
  showAnnotationSidebar,
  showAnnotationInput,
  annotationText,
  annotationPosition,
  imageRef,
  containerRef,
  onToolChange,
  onZoomIn,
  onZoomOut,
  onPrevPage,
  onNextPage,
  onImageClick,
  onAnnotationTextChange,
  onSaveAnnotation,
  onCancelAnnotation,
  onDeleteAnnotation,
}: EditorCanvasProps) {
  const getCanvasColSpan = () => {
    let colSpan = 12;
    if (showPageSidebar) colSpan -= 2;
    if (showAnnotationSidebar) colSpan -= 3;

    // Return a proper Tailwind class
    switch (colSpan) {
      case 7: return 'col-span-7';
      case 9: return 'col-span-9';
      case 10: return 'col-span-10';
      case 11: return 'col-span-11';
      case 12: return 'col-span-12';
      default: return 'col-span-7';
    }
  };

  return (
    <div className={`${getCanvasColSpan()} transition-all duration-200`}>
      <Card>
        <CardHeader className="py-2 px-4 flex flex-row items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onPrevPage}
              disabled={sheetMusic.currentPageIndex === 0}
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Previous Page</span>
            </Button>
            <span className="text-sm">
              Page {sheetMusic.currentPageIndex + 1} of {sheetMusic.pages.length}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={onNextPage}
              disabled={sheetMusic.currentPageIndex === sheetMusic.pages.length - 1}
            >
              <ArrowRight className="h-4 w-4" />
              <span className="sr-only">Next Page</span>
            </Button>
          </div>

          <div className="flex items-center space-x-1">
            <Button
              variant={tool === "select" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onToolChange("select")}
            >
              <PenLine className="h-4 w-4 mr-1" />
              Select
            </Button>
            <Button
              variant={tool === "annotate" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onToolChange("annotate")}
            >
              <Info className="h-4 w-4 mr-1" />
              Annotate
            </Button>
            <Separator orientation="vertical" className="h-6 mx-1" />
            <Button size="icon" variant="ghost" onClick={onZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs w-12 text-center">{Math.round(zoom * 100)}%</span>
            <Button size="icon" variant="ghost" onClick={onZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-hidden">
          <div
            ref={containerRef}
            className="relative overflow-auto bg-muted/30 p-4"
            style={{ height: "calc(100vh - 200px)" }}
          >
            <div style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}>
              {currentPage ? (
                <img
                  ref={imageRef}
                  src={currentPage.imageUrl}
                  alt={`Page ${sheetMusic.currentPageIndex + 1}`}
                  className={`cursor-${tool === "annotate" ? "crosshair" : "default"}`}
                  onClick={onImageClick}
                />
              ) : (
                <div className="flex items-center justify-center h-96 bg-muted">
                  <p className="text-muted-foreground">No page content</p>
                </div>
              )}

              {/* Render annotations for current page */}
              {currentPage?.annotations?.map((annotation) => (
                <AnnotationOverlay
                  key={annotation.id}
                  annotation={annotation}
                  onDelete={() => onDeleteAnnotation(currentPage.id, annotation.id)}
                />
              ))}

              {/* Annotation input */}
              {showAnnotationInput && (
                <AnnotationInput
                  position={annotationPosition}
                  text={annotationText}
                  onTextChange={onAnnotationTextChange}
                  onSave={onSaveAnnotation}
                  onCancel={onCancelAnnotation}
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

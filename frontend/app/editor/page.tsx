"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEditor } from "@/hooks/useEditor";
import {
  PagesSidebar,
  EditorCanvas,
  AnnotationsSidebar,
  EditorHeader,
  EmptyState,
} from "@/components/editor";
import { Loader2 } from "lucide-react";

export default function EditorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const editor = useEditor(id);

  // Initialize sheet music when id changes
  useEffect(() => {
    if (id) {
      editor.initializeSheetMusic(id);
    }
  }, [id, editor]);

  // If no sheet music is loaded, show empty state
  if (editor.isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (editor.error) {
    return <div className="text-red-500 text-center">{editor.error}</div>;
  }

  if (!editor.currentSheetMusic) {
    return <EmptyState onScanNew={() => router.push("/scan")} />;
  }

  const currentPage = editor.getCurrentPage();

  // Handlers for annotations sidebar
  const handleUpdateAnnotation = (annotationId: string, text: string) => {
    if (!currentPage || !editor.currentSheetMusic) return;
    editor.updateAnnotation(editor.currentSheetMusic.id, currentPage.id, annotationId, text);
  };

  const handleDeleteAnnotationFromSidebar = (annotationId: string) => {
    if (!currentPage || !editor.currentSheetMusic) return;
    editor.deleteAnnotation(editor.currentSheetMusic.id, currentPage.id, annotationId);
  };

  const handleDeleteAnnotationFromCanvas = (pageId: string, annotationId: string) => {
    if (!editor.currentSheetMusic) return;
    editor.deleteAnnotation(editor.currentSheetMusic.id, pageId, annotationId);
  };

  return (
    <div className="container mx-auto py-6">
      <EditorHeader
        sheetMusic={editor.currentSheetMusic}
        onSave={editor.saveChanges}
        onAnalyze={editor.goToAnalysis}
      />

      <div className="grid grid-cols-12 gap-4">
        <PagesSidebar
          sheetMusic={editor.currentSheetMusic}
          isOpen={editor.showPageSidebar}
          onToggle={() => editor.setShowPageSidebar(!editor.showPageSidebar)}
          onPageSelect={editor.goToPage}
          onAddPage={editor.handleAddPage}
          onDeletePage={editor.handleDeletePage}
          onMovePageUp={editor.movePageUp}
          onMovePageDown={editor.movePageDown}
          fileInputRef={editor.fileInputRef}
          onFileUpload={editor.handleFileUpload}
        />

        <EditorCanvas
          sheetMusic={editor.currentSheetMusic}
          currentPage={currentPage}
          zoom={editor.zoom}
          tool={editor.tool}
          showPageSidebar={editor.showPageSidebar}
          showAnnotationSidebar={editor.showAnnotationSidebar}
          showAnnotationInput={editor.showAnnotationInput}
          annotationText={editor.annotationText}
          annotationPosition={editor.annotationPosition}
          imageRef={editor.imageRef}
          containerRef={editor.containerRef}
          onToolChange={editor.setTool}
          onZoomIn={editor.handleZoomIn}
          onZoomOut={editor.handleZoomOut}
          onPrevPage={editor.prevPage}
          onNextPage={editor.nextPage}
          onImageClick={editor.handleImageClick}
          onAnnotationTextChange={editor.setAnnotationText}
          onSaveAnnotation={editor.saveAnnotation}
          onCancelAnnotation={editor.cancelAnnotation}
          onDeleteAnnotation={handleDeleteAnnotationFromCanvas}
        />

        <AnnotationsSidebar
          currentPage={currentPage}
          isOpen={editor.showAnnotationSidebar}
          onToggle={() => editor.setShowAnnotationSidebar(!editor.showAnnotationSidebar)}
          onUpdateAnnotation={handleUpdateAnnotation}
          onDeleteAnnotation={handleDeleteAnnotationFromSidebar}
        />
      </div>
    </div>
  );
}
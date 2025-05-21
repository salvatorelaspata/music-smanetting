"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  PenLine,
  Undo2,
  Redo2,
  Save,
  Play,
  Download,
  Trash2,
  ZoomIn,
  ZoomOut,
  Info,
  Plus,
  ChevronRight,
  ChevronLeft,
  MoveUp,
  MoveDown,
  ArrowLeft,
  ArrowRight,
  FileTextIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useSheetMusicStore, SheetMusicPage } from "@/lib/store/useSheetMusicStore";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function EditorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const id = searchParams.get("id");
  const [zoom, setZoom] = useState(1);
  const [tool, setTool] = useState<"select" | "annotate">("select");
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [annotationText, setAnnotationText] = useState("");
  const [annotationPosition, setAnnotationPosition] = useState({ x: 0, y: 0 });
  const [showAnnotationInput, setShowAnnotationInput] = useState(false);
  const [showPageSidebar, setShowPageSidebar] = useState(true);
  const [showAnnotationSidebar, setShowAnnotationSidebar] = useState(true);

  const {
    currentSheetMusic,
    setCurrentSheetMusic,
    updateSheetMusic,
    addAnnotation,
    updateAnnotation,
    deleteAnnotation,
    setCurrentPageIndex,
    addPage,
    deletePage,
    reorderPages
  } = useSheetMusicStore();

  // Load sheet music data from id
  useEffect(() => {
    if (id) {
      setCurrentSheetMusic(id);
    }
  }, [id, setCurrentSheetMusic]);

  // Handle click on image for annotation
  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (tool !== "annotate" || !containerRef.current || !currentSheetMusic) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    setAnnotationPosition({ x, y });
    setShowAnnotationInput(true);
  };

  // Save annotation
  const saveAnnotation = () => {
    if (!currentSheetMusic || !annotationText.trim()) return;

    const currentPage = getCurrentPage();
    if (!currentPage) return;

    addAnnotation(currentSheetMusic.id, currentPage.id, annotationText, annotationPosition);
    setAnnotationText("");
    setShowAnnotationInput(false);

    toast({
      title: "Annotation Added",
      description: "Your annotation has been added to the sheet music.",
    });
  };

  // Save all changes
  const saveChanges = () => {
    if (!currentSheetMusic) return;

    updateSheetMusic(currentSheetMusic.id, {
      status: "edited",
    });

    toast({
      title: "Changes Saved",
      description: "Your edits have been saved successfully.",
    });
  };

  // Handle zoom controls
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  };

  // Navigate to analysis page
  const goToAnalysis = () => {
    if (!currentSheetMusic) return;
    router.push(`/analysis?id=${currentSheetMusic.id}`);
  };

  // Helper to get current page
  const getCurrentPage = (): SheetMusicPage | undefined => {
    if (!currentSheetMusic || currentSheetMusic.pages.length === 0) return undefined;
    return currentSheetMusic.pages[currentSheetMusic.currentPageIndex];
  };

  // Handle page navigation
  const goToPage = (index: number) => {
    if (!currentSheetMusic) return;
    setCurrentPageIndex(currentSheetMusic.id, index);
  };

  const nextPage = () => {
    if (!currentSheetMusic) return;
    const newIndex = Math.min(currentSheetMusic.currentPageIndex + 1, currentSheetMusic.pages.length - 1);
    setCurrentPageIndex(currentSheetMusic.id, newIndex);
  };

  const prevPage = () => {
    if (!currentSheetMusic) return;
    const newIndex = Math.max(currentSheetMusic.currentPageIndex - 1, 0);
    setCurrentPageIndex(currentSheetMusic.id, newIndex);
  };

  // Handle page reordering
  const movePageUp = () => {
    if (!currentSheetMusic || currentSheetMusic.currentPageIndex === 0) return;

    const currentIndex = currentSheetMusic.currentPageIndex;
    const newOrder = [...currentSheetMusic.pages.map(p => p.id)];
    [newOrder[currentIndex - 1], newOrder[currentIndex]] = [newOrder[currentIndex], newOrder[currentIndex - 1]];

    reorderPages(currentSheetMusic.id, newOrder);
    setCurrentPageIndex(currentSheetMusic.id, currentIndex - 1);
  };

  const movePageDown = () => {
    if (!currentSheetMusic || currentSheetMusic.currentPageIndex === currentSheetMusic.pages.length - 1) return;

    const currentIndex = currentSheetMusic.currentPageIndex;
    const newOrder = [...currentSheetMusic.pages.map(p => p.id)];
    [newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]];

    reorderPages(currentSheetMusic.id, newOrder);
    setCurrentPageIndex(currentSheetMusic.id, currentIndex + 1);
  };

  // Handle page deletion
  const handleDeletePage = () => {
    if (!currentSheetMusic || !getCurrentPage() || currentSheetMusic.pages.length <= 1) return;

    const currentPage = getCurrentPage();
    if (!currentPage) return;

    deletePage(currentSheetMusic.id, currentPage.id);

    toast({
      title: "Page Deleted",
      description: "The page has been removed from your sheet music.",
    });
  };

  // File input for adding new pages
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddPage = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentSheetMusic) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        addPage(currentSheetMusic.id, e.target.result as string);

        toast({
          title: "Page Added",
          description: "A new page has been added to your sheet music.",
        });
      }
    };
    reader.readAsDataURL(file);
  };

  if (!currentSheetMusic) {
    return (
      <div className="container mx-auto py-16 text-center">
        <h1 className="text-3xl font-bold mb-6">No Sheet Music Selected</h1>
        <p className="mb-8">Please scan or select a sheet music to edit.</p>
        <Button onClick={() => router.push("/scan")}>
          Scan New Sheet Music
        </Button>
      </div>
    );
  }

  const currentPage = getCurrentPage();

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{currentSheetMusic.name}</h1>
          <p className="text-muted-foreground">
            Page {currentSheetMusic.currentPageIndex + 1} of {currentSheetMusic.pages.length} •
            Last updated: {new Date(currentSheetMusic.updatedAt).toLocaleString()}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={saveChanges}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button size="sm" onClick={goToAnalysis}>
            Analyze
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Pages sidebar */}
        <Card className={`${showPageSidebar ? 'col-span-2' : 'col-span-1'} transition-all duration-200 overflow-hidden`}>
          <CardHeader className="p-3 flex flex-row items-center justify-between">
            <CardTitle className={`text-sm ${!showPageSidebar && 'sr-only'}`}>Pages</CardTitle>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setShowPageSidebar(!showPageSidebar)}>
              {showPageSidebar ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </CardHeader>
          <CardContent className={`p-2 ${!showPageSidebar && 'hidden'}`}>
            <ScrollArea className="h-[calc(100vh-240px)]">
              <div className="space-y-2">
                {currentSheetMusic.pages.map((page, index) => (
                  <div
                    key={page.id}
                    className={`relative rounded-md overflow-hidden border-2 cursor-pointer transition-all ${currentSheetMusic.currentPageIndex === index ? 'border-primary' : 'border-transparent hover:border-muted-foreground/20'
                      }`}
                    onClick={() => goToPage(index)}
                  >
                    <img
                      src={page.imageUrl}
                      alt={`Page ${index + 1}`}
                      className="w-full h-auto object-contain"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm px-2 py-0.5 text-xs text-center">
                      Page {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className={`p-3 ${!showPageSidebar && 'hidden'}`}>
            <div className="w-full grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleAddPage}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleDeletePage}
                disabled={currentSheetMusic.pages.length <= 1}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={movePageUp}
                disabled={currentSheetMusic.currentPageIndex === 0}
              >
                <MoveUp className="h-3 w-3 mr-1" />
                Up
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={movePageDown}
                disabled={currentSheetMusic.currentPageIndex === currentSheetMusic.pages.length - 1}
              >
                <MoveDown className="h-3 w-3 mr-1" />
                Down
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={handleFileUpload}
            />
          </CardFooter>
        </Card>

        {/* Main content area */}
        <div className={`${showPageSidebar ? 'col-span-7' : 'col-span-9'} ${showAnnotationSidebar ? '' : 'col-span-11'} transition-all duration-200`}>
          <Card>
            <CardHeader className="py-2 px-4 flex flex-row items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={prevPage}
                  disabled={currentSheetMusic.currentPageIndex === 0}
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="sr-only">Previous Page</span>
                </Button>
                <span className="text-sm">
                  Page {currentSheetMusic.currentPageIndex + 1} of {currentSheetMusic.pages.length}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={nextPage}
                  disabled={currentSheetMusic.currentPageIndex === currentSheetMusic.pages.length - 1}
                >
                  <ArrowRight className="h-4 w-4" />
                  <span className="sr-only">Next Page</span>
                </Button>
              </div>

              <div className="flex items-center space-x-1">
                <Button variant={tool === "select" ? "secondary" : "ghost"} size="sm" onClick={() => setTool("select")}>
                  <PenLine className="h-4 w-4 mr-1" />
                  Select
                </Button>
                <Button variant={tool === "annotate" ? "secondary" : "ghost"} size="sm" onClick={() => setTool("annotate")}>
                  <Info className="h-4 w-4 mr-1" />
                  Annotate
                </Button>
                <Separator orientation="vertical" className="h-6 mx-1" />
                <Button size="icon" variant="ghost" onClick={handleZoomOut}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-xs w-12 text-center">{Math.round(zoom * 100)}%</span>
                <Button size="icon" variant="ghost" onClick={handleZoomIn}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-0 overflow-hidden">
              {/* Sheet music display */}
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
                      alt={`Page ${currentSheetMusic.currentPageIndex + 1}`}
                      className={`cursor-${tool === "annotate" ? "crosshair" : "default"}`}
                      onClick={handleImageClick}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-96 bg-muted">
                      <p className="text-muted-foreground">No page content</p>
                    </div>
                  )}

                  {/* Render annotations for current page */}
                  {currentPage?.annotations?.map((annotation) => (
                    <div
                      key={annotation.id}
                      className="absolute bg-yellow-200/80 dark:bg-yellow-900/80 p-1 rounded shadow-md"
                      style={{
                        left: annotation.position.x,
                        top: annotation.position.y,
                        maxWidth: "200px"
                      }}
                    >
                      <div className="flex text-xs justify-between mb-1">
                        <span className="font-bold">Note</span>
                        <button
                          onClick={() => currentPage && deleteAnnotation(currentSheetMusic.id, currentPage.id, annotation.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="text-xs">{annotation.text}</p>
                    </div>
                  ))}

                  {/* Annotation input */}
                  {showAnnotationInput && (
                    <div
                      className="absolute bg-card border rounded shadow-lg p-2"
                      style={{
                        left: annotationPosition.x,
                        top: annotationPosition.y
                      }}
                    >
                      <Textarea
                        placeholder="Enter annotation..."
                        value={annotationText}
                        onChange={(e) => setAnnotationText(e.target.value)}
                        className="min-h-0 text-sm mb-2"
                        rows={2}
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowAnnotationInput(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={saveAnnotation}
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Annotations sidebar */}
        <Card className={`${showAnnotationSidebar ? 'col-span-3' : 'col-span-1'} transition-all duration-200 overflow-hidden`}>
          <CardHeader className="p-3 flex flex-row items-center justify-between">
            <CardTitle className={`text-sm ${!showAnnotationSidebar && 'sr-only'}`}>Annotations</CardTitle>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setShowAnnotationSidebar(!showAnnotationSidebar)}>
              {showAnnotationSidebar ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </CardHeader>
          <CardContent className={`p-3 ${!showAnnotationSidebar && 'hidden'}`}>
            <ScrollArea className="h-[calc(100vh-240px)]">
              {currentPage?.annotations && currentPage.annotations.length > 0 ? (
                <div className="space-y-4">
                  {currentPage.annotations.map((annotation) => (
                    <div
                      key={annotation.id}
                      className="p-3 border rounded-md"
                    >
                      <div className="flex justify-between mb-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          Position: ({Math.round(annotation.position.x)}, {Math.round(annotation.position.y)})
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={() => currentPage && deleteAnnotation(currentSheetMusic.id, currentPage.id, annotation.id)}
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                      <Textarea
                        value={annotation.text}
                        onChange={(e) => currentPage && updateAnnotation(currentSheetMusic.id, currentPage.id, annotation.id, e.target.value)}
                        className="min-h-0"
                        rows={2}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileTextIcon className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No annotations on this page</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Use the Annotate tool to add notes to this page
                  </p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
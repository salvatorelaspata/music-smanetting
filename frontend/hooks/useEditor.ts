import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useSheetMusicStore } from "@/lib/store/useSheetMusicStore";

export function useEditor(sheetMusicId: string | null) {
  const router = useRouter();
  const { toast } = useToast();

  // UI State
  const [zoom, setZoom] = useState(1);
  const [tool, setTool] = useState<"select" | "annotate">("select");
  const [showPageSidebar, setShowPageSidebar] = useState(true);
  const [showAnnotationSidebar, setShowAnnotationSidebar] = useState(true);

  // Annotation State
  const [annotationText, setAnnotationText] = useState("");
  const [annotationPosition, setAnnotationPosition] = useState({ x: 0, y: 0 });
  const [showAnnotationInput, setShowAnnotationInput] = useState(false);

  // Refs
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Store
  const {
    currentSheetMusic,
    isLoading,
    error,
    fetchSheetMusicById,
    updateSheetMusic,
    addAnnotation,
    updateAnnotation,
    deleteAnnotation,
    setCurrentPageIndex,
    addPage,
    deletePage,
    reorderPages
  } = useSheetMusicStore();

  // Helper Functions
  const getCurrentPage = () => {
    if (!currentSheetMusic || currentSheetMusic.pages.length === 0) return undefined;
    return currentSheetMusic.pages[currentSheetMusic.currentPageIndex];
  };

  // Zoom Controls
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  };

  // Page Navigation
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

  // Page Management
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

  // Annotation Management
  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (tool !== "annotate" || !containerRef.current || !currentSheetMusic) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    setAnnotationPosition({ x, y });
    setShowAnnotationInput(true);
  };

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

  const cancelAnnotation = () => {
    setShowAnnotationInput(false);
    setAnnotationText("");
  };

  // Save Changes
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

  // Navigation
  const goToAnalysis = () => {
    if (!currentSheetMusic) return;
    router.push(`/analysis?id=${currentSheetMusic.id}`);
  };

  // Initialize sheet music
  const initializeSheetMusic = (id: string) => {
    fetchSheetMusicById(id);
  };

  return {
    // State
    zoom,
    tool,
    setTool,
    showPageSidebar,
    setShowPageSidebar,
    showAnnotationSidebar,
    setShowAnnotationSidebar,
    annotationText,
    setAnnotationText,
    annotationPosition,
    showAnnotationInput,
    isLoading,
    error,

    // Refs
    imageRef,
    containerRef,
    fileInputRef,

    // Store data
    currentSheetMusic,
    getCurrentPage,

    // Store actions
    updateAnnotation,
    deleteAnnotation,

    // Functions
    handleZoomIn,
    handleZoomOut,
    goToPage,
    nextPage,
    prevPage,
    movePageUp,
    movePageDown,
    handleDeletePage,
    handleAddPage,
    handleFileUpload,
    handleImageClick,
    saveAnnotation,
    cancelAnnotation,
    saveChanges,
    goToAnalysis,
    initializeSheetMusic,
  };
}

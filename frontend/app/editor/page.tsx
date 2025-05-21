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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useSheetMusicStore } from "@/lib/store/useSheetMusicStore";

export default function EditorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const id = searchParams.get("id");
  const [zoom, setZoom] = useState(1);
  const [tool, setTool] = useState<"select" | "annotate">("select");
  const [activeTab, setActiveTab] = useState("notation");
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [annotationText, setAnnotationText] = useState("");
  const [annotationPosition, setAnnotationPosition] = useState({ x: 0, y: 0 });
  const [showAnnotationInput, setShowAnnotationInput] = useState(false);

  const {
    currentSheetMusic,
    setCurrentSheetMusic,
    updateSheetMusic,
    addAnnotation,
    updateAnnotation,
    deleteAnnotation
  } = useSheetMusicStore();

  // Load sheet music data from id
  useEffect(() => {
    if (id) {
      setCurrentSheetMusic(id);
    }
  }, [id, setCurrentSheetMusic]);

  // Handle click on image for annotation
  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (tool !== "annotate" || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    setAnnotationPosition({ x, y });
    setShowAnnotationInput(true);
  };

  // Save annotation
  const saveAnnotation = () => {
    if (!currentSheetMusic || !annotationText.trim()) return;

    addAnnotation(currentSheetMusic.id, annotationText, annotationPosition);
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

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{currentSheetMusic.name}</h1>
          <p className="text-muted-foreground">
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Tools sidebar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Tools</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={tool === "select" ? "default" : "outline"}
                size="sm"
                onClick={() => setTool("select")}
                className="justify-start"
              >
                <PenLine className="h-4 w-4 mr-2" />
                Select
              </Button>
              <Button
                variant={tool === "annotate" ? "default" : "outline"}
                size="sm"
                onClick={() => setTool("annotate")}
                className="justify-start"
              >
                <Info className="h-4 w-4 mr-2" />
                Annotate
              </Button>
            </div>

            <Separator />

            <div className="space-y-2">
              <p className="text-sm font-medium">Zoom</p>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={handleZoomOut}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm">{Math.round(zoom * 100)}%</span>
                <Button size="sm" variant="outline" onClick={handleZoomIn}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <p className="text-sm font-medium">History</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Undo2 className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <Redo2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <p className="text-sm font-medium">Export</p>
              <Button size="sm" variant="outline" className="w-full justify-start">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main content area */}
        <div className="lg:col-span-10">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-2 max-w-md mb-6">
              <TabsTrigger value="notation">Sheet Music</TabsTrigger>
              <TabsTrigger value="annotations">Annotations</TabsTrigger>
            </TabsList>

            <TabsContent value="notation" className="space-y-4">
              <Card>
                <CardContent className="p-0 overflow-hidden">
                  {/* Sheet music display */}
                  <div
                    ref={containerRef}
                    className="relative overflow-auto bg-muted/30 p-4"
                    style={{ minHeight: "60vh", maxHeight: "calc(100vh - 300px)" }}
                  >
                    <div style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}>
                      <img
                        ref={imageRef}
                        src={currentSheetMusic.imageUrl}
                        alt="Sheet Music"
                        className="cursor-crosshair"
                        onClick={handleImageClick}
                      />

                      {/* Render annotations */}
                      {currentSheetMusic.annotations?.map((annotation) => (
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
                              onClick={() => deleteAnnotation(currentSheetMusic.id, annotation.id)}
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

              {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Playback</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" disabled>
                      <Play className="h-4 w-4 mr-2" />
                      Play Sheet Music
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      Playback feature coming soon
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Export Options</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" disabled>
                      <Download className="h-4 w-4 mr-2" />
                      PDF
                    </Button>
                    <Button variant="outline" className="w-full justify-start" disabled>
                      <Download className="h-4 w-4 mr-2" />
                      MusicXML
                    </Button>
                  </CardContent>
                </Card>
              </div> */}
            </TabsContent>

            <TabsContent value="annotations" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Annotations</CardTitle>
                </CardHeader>
                <CardContent>
                  {currentSheetMusic.annotations && currentSheetMusic.annotations.length > 0 ? (
                    <div className="space-y-4">
                      {currentSheetMusic.annotations.map((annotation) => (
                        <div
                          key={annotation.id}
                          className="p-3 border rounded-md"
                        >
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">
                              Position: ({Math.round(annotation.position.x)}, {Math.round(annotation.position.y)})
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteAnnotation(currentSheetMusic.id, annotation.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                          <Textarea
                            value={annotation.text}
                            onChange={(e) => updateAnnotation(currentSheetMusic.id, annotation.id, e.target.value)}
                            className="min-h-0"
                            rows={2}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Info className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No annotations yet</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Switch to the Sheet Music tab and use the Annotate tool to add notes
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
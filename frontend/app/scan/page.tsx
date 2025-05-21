"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Camera, Upload, FilePenLine, AlertCircle, Loader2, Plus, Trash, X, MoveLeft, MoveRight } from "lucide-react";
import { useSheetMusicStore } from "@/lib/store/useSheetMusicStore";
import { initOpenCV, detectDocumentEdges, detectStaffLines } from "@/lib/opencv/opencvSetup";
import { useToast } from "@/hooks/use-toast";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

export default function ScanPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("upload");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [processingStatus, setProcessingStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isOpenCVReady, setIsOpenCVReady] = useState(false);
  const [detectedCorners, setDetectedCorners] = useState<{ x: number; y: number }[] | null>(null);
  const animationFrameRef = useRef<number>();
  const [isDragging, setIsDragging] = useState(false);

  const { addSheetMusic, setIsScanning, setIsProcessing } = useSheetMusicStore();

  // Initialize OpenCV
  useEffect(() => {
    initOpenCV()
      .then(() => {
        setIsOpenCVReady(true);
        console.log("OpenCV is ready");
      })
      .catch((error) => {
        console.error("Failed to initialize OpenCV", error);
        toast({
          title: "Error",
          description: "Failed to initialize OpenCV. Please refresh the page and try again.",
          variant: "destructive",
        });
      });

    return () => {
      // Cleanup stream when component unmounts
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Process video frame
  const processVideoFrame = () => {
    if (!videoRef.current || !canvasRef.current || !overlayCanvasRef.current || !isOpenCVReady) {
      animationFrameRef.current = requestAnimationFrame(processVideoFrame);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;

    // Set canvas dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    overlayCanvas.width = video.videoWidth;
    overlayCanvas.height = video.videoHeight;

    // Draw video frame to canvas
    const ctx = canvas.getContext("2d");
    const overlayCtx = overlayCanvas.getContext("2d");

    if (!ctx || !overlayCtx) {
      animationFrameRef.current = requestAnimationFrame(processVideoFrame);
      return;
    }

    ctx.drawImage(video, 0, 0);

    // Clear previous overlay
    overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

    // Get frame data and detect document
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const { corners, processedImageData } = detectDocumentEdges(imageData);

    // Update detected corners
    setDetectedCorners(corners);

    // Draw document outline
    if (corners) {
      overlayCtx.strokeStyle = "#00ff00";
      overlayCtx.lineWidth = 3;
      overlayCtx.beginPath();
      overlayCtx.moveTo(corners[0].x, corners[0].y);
      for (let i = 1; i <= 4; i++) {
        overlayCtx.lineTo(corners[i % 4].x, corners[i % 4].y);
      }
      overlayCtx.stroke();
    }

    animationFrameRef.current = requestAnimationFrame(processVideoFrame);
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newFiles: File[] = [];
    const fileReaders: FileReader[] = [];
    const newImageUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      newFiles.push(file);

      const reader = new FileReader();
      fileReaders.push(reader);

      reader.onload = (e) => {
        if (e.target?.result) {
          newImageUrls.push(e.target.result as string);

          // If we've processed all files, update state
          if (newImageUrls.length === files.length) {
            setImageFiles(prevFiles => [...prevFiles, ...newFiles]);
            setImagePreviewUrls(prevUrls => [...prevUrls, ...newImageUrls]);
            setActiveTab("preview");
          }
        }
      };

      reader.readAsDataURL(file);
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

    const newFiles: File[] = [];
    const fileReaders: FileReader[] = [];
    const newImageUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!file.type.match('image.*') && file.type !== 'application/pdf') {
        continue; // Skip non-image, non-PDF files
      }

      newFiles.push(file);
      const reader = new FileReader();
      fileReaders.push(reader);

      reader.onload = (e) => {
        if (e.target?.result) {
          newImageUrls.push(e.target.result as string);

          // If we've processed all valid files, update state
          if (newImageUrls.length === newFiles.length) {
            setImageFiles(prevFiles => [...prevFiles, ...newFiles]);
            setImagePreviewUrls(prevUrls => [...prevUrls, ...newImageUrls]);
            setActiveTab("preview");
          }
        }
      };

      reader.readAsDataURL(file);
    }

    if (newFiles.length === 0) {
      toast({
        title: "Invalid files",
        description: "Please upload image or PDF files.",
        variant: "destructive",
      });
    }
  };

  // Start camera
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          animationFrameRef.current = requestAnimationFrame(processVideoFrame);
        };
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  // Take photo from camera
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !detectedCorners) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);

    const capturedImageUrl = canvas.toDataURL("image/png");
    setImagePreviewUrls(prev => [...prev, capturedImageUrl]);

    // Create a file from the canvas
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `scan-${Date.now()}.png`, { type: 'image/png' });
        setImageFiles(prev => [...prev, file]);
      }
    });

    stopCamera();
    setActiveTab("preview");
  };

  // Remove a page from preview
  const removePage = (index: number) => {
    setImageFiles(prev => {
      const newFiles = [...prev];
      newFiles.splice(index, 1);
      return newFiles;
    });

    setImagePreviewUrls(prev => {
      const newUrls = [...prev];
      newUrls.splice(index, 1);
      return newUrls;
    });

    // Adjust the current preview index if needed
    if (currentPreviewIndex >= index && currentPreviewIndex > 0) {
      setCurrentPreviewIndex(prev => prev - 1);
    }
  };

  // Move page left in the order
  const movePageLeft = (index: number) => {
    if (index === 0) return;

    setImageFiles(prev => {
      const newFiles = [...prev];
      [newFiles[index - 1], newFiles[index]] = [newFiles[index], newFiles[index - 1]];
      return newFiles;
    });

    setImagePreviewUrls(prev => {
      const newUrls = [...prev];
      [newUrls[index - 1], newUrls[index]] = [newUrls[index], newUrls[index - 1]];
      return newUrls;
    });

    if (currentPreviewIndex === index) {
      setCurrentPreviewIndex(index - 1);
    } else if (currentPreviewIndex === index - 1) {
      setCurrentPreviewIndex(index);
    }
  };

  // Move page right in the order
  const movePageRight = (index: number) => {
    if (index === imagePreviewUrls.length - 1) return;

    setImageFiles(prev => {
      const newFiles = [...prev];
      [newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]];
      return newFiles;
    });

    setImagePreviewUrls(prev => {
      const newUrls = [...prev];
      [newUrls[index], newUrls[index + 1]] = [newUrls[index + 1], newUrls[index]];
      return newUrls;
    });

    if (currentPreviewIndex === index) {
      setCurrentPreviewIndex(index + 1);
    } else if (currentPreviewIndex === index + 1) {
      setCurrentPreviewIndex(index);
    }
  };

  // Process the images
  const processImages = async () => {
    if (imagePreviewUrls.length === 0 || !isOpenCVReady) {
      toast({
        title: "Error",
        description: "Please add at least one image before processing.",
        variant: "destructive",
      });
      return;
    }

    setProcessingStatus("processing");
    setIsProcessing(true);

    try {
      // Create an array of page objects with processed image URLs
      const pages = imagePreviewUrls.map(imageUrl => ({
        imageUrl
      }));

      // Add to store with all pages
      const id = addSheetMusic({
        name: "Sheet Music " + new Date().toLocaleString(),
        pages
      });

      setProcessingStatus("success");

      // Navigate to editor with the new ID
      setTimeout(() => {
        router.push(`/editor?id=${id}`);
      }, 1500);
    } catch (error) {
      console.error("Error processing images:", error);
      setProcessingStatus("error");
      toast({
        title: "Processing Error",
        description: "Failed to process the images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle tab change
  useEffect(() => {
    if (activeTab === "camera") {
      startCamera();
    } else {
      stopCamera();
    }
  }, [activeTab]);

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Scan Sheet Music</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Capture or Upload Multiple Pages</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="upload">Upload Images</TabsTrigger>
              <TabsTrigger value="camera">Use Camera</TabsTrigger>
            </TabsList>

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

              {imagePreviewUrls.length > 0 && (
                <Button
                  className="w-full"
                  variant="secondary"
                  onClick={() => setActiveTab("preview")}
                >
                  View {imagePreviewUrls.length} Selected Images
                </Button>
              )}
            </TabsContent>

            <TabsContent value="camera" className="space-y-4">
              <div className="relative w-full overflow-hidden rounded-md aspect-video bg-muted">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <canvas
                  ref={overlayCanvasRef}
                  className="absolute top-0 left-0 w-full h-full pointer-events-none"
                />
              </div>
              <div className="flex justify-center">
                <Button
                  onClick={capturePhoto}
                  className="px-6"
                  disabled={!detectedCorners}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  {detectedCorners ? "Capture" : "Align document"}
                </Button>
              </div>

              {imagePreviewUrls.length > 0 && (
                <Button
                  className="w-full"
                  variant="secondary"
                  onClick={() => setActiveTab("preview")}
                >
                  View {imagePreviewUrls.length} Captured Images
                </Button>
              )}
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              {imagePreviewUrls.length > 0 ? (
                <div className="space-y-6">
                  {/* Current image preview */}
                  <div className="relative w-full overflow-hidden rounded-md border">
                    <img
                      src={imagePreviewUrls[currentPreviewIndex]}
                      alt={`Sheet music page ${currentPreviewIndex + 1}`}
                      className="w-full h-auto object-contain"
                    />
                    <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-sm">
                      Page {currentPreviewIndex + 1} of {imagePreviewUrls.length}
                    </div>
                  </div>

                  {/* Pagination for multiple pages */}
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPreviewIndex > 0) {
                              setCurrentPreviewIndex(currentPreviewIndex - 1);
                            }
                          }}
                          aria-disabled={currentPreviewIndex === 0}
                        />
                      </PaginationItem>

                      {imagePreviewUrls.map((_, index) => (
                        <PaginationItem key={index}>
                          <PaginationLink
                            href="#"
                            isActive={index === currentPreviewIndex}
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPreviewIndex(index);
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
                            if (currentPreviewIndex < imagePreviewUrls.length - 1) {
                              setCurrentPreviewIndex(currentPreviewIndex + 1);
                            }
                          }}
                          aria-disabled={currentPreviewIndex === imagePreviewUrls.length - 1}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>

                  {/* Page management controls */}
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => movePageLeft(currentPreviewIndex)}
                      disabled={currentPreviewIndex === 0}
                    >
                      <MoveLeft className="h-4 w-4 mr-1" />
                      Move Left
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removePage(currentPreviewIndex)}
                      className="text-red-500 hover:bg-red-500/10"
                    >
                      <Trash className="h-4 w-4 mr-1" />
                      Remove Page
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => movePageRight(currentPreviewIndex)}
                      disabled={currentPreviewIndex === imagePreviewUrls.length - 1}
                    >
                      <MoveRight className="h-4 w-4 mr-1" />
                      Move Right
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setActiveTab(imagePreviewUrls.length > 0 ? "upload" : "camera");
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add More Pages
                    </Button>
                  </div>

                  {/* Process button */}
                  <div className="flex justify-between pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setImageFiles([]);
                        setImagePreviewUrls([]);
                        setCurrentPreviewIndex(0);
                        setActiveTab("upload");
                      }}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Clear All
                    </Button>

                    <Button
                      onClick={processImages}
                      disabled={processingStatus === "processing"}
                    >
                      {processingStatus === "processing" && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Process {imagePreviewUrls.length} {imagePreviewUrls.length === 1 ? "Page" : "Pages"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-lg font-medium mb-2">No Pages Selected</h3>
                  <p className="text-muted-foreground mb-4">
                    Please upload or capture at least one page
                  </p>
                  <Button onClick={() => setActiveTab("upload")}>
                    Upload Images
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        {isOpenCVReady ? (
          <CardFooter className="flex justify-center text-sm text-muted-foreground">
            <div className="flex items-center">
              <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
              OpenCV Ready
            </div>
          </CardFooter>
        ) : (
          <CardFooter className="flex justify-center text-sm text-muted-foreground">
            <div className="flex items-center">
              <Loader2 className="h-3 w-3 animate-spin mr-2" />
              Initializing OpenCV...
            </div>
          </CardFooter>
        )}
      </Card>

      {/* <Separator className="my-6" /> */}

      {/* <div className="prose dark:prose-invert max-w-none">
        <h2>Tips for best results</h2>
        <ul>
          <li>Ensure good lighting without shadows</li>
          <li>Avoid glare or reflections on the sheet music</li>
          <li>Position the sheet music flat and centered</li>
          <li>Capture the entire page in the frame</li>
          <li>Keep the camera steady when taking a photo</li>
          <li>For multi-page scores, maintain consistent orientation</li>
        </ul>
      </div> */}

      {/* Hidden elements for processing */}
      <canvas ref={canvasRef} className="hidden" />
      <canvas ref={previewCanvasRef} className="hidden" />
    </div>
  );
}
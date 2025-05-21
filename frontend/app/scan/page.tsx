"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Camera, Upload, FilePenLine, AlertCircle, Loader2 } from "lucide-react";
import { useSheetMusicStore } from "@/lib/store/useSheetMusicStore";
import { initOpenCV, detectDocumentEdges, detectStaffLines } from "@/lib/opencv/opencvSetup";
import { useToast } from "@/hooks/use-toast";

export default function ScanPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("upload");
  const [image, setImage] = useState<string | null>(null);
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
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
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

    const file = files[0];
    if (!file.type.match('image.*') && file.type !== 'application/pdf') {
      toast({
        title: "Invalid file type",
        description: "Please upload an image or PDF file.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
      setActiveTab("preview");
    };
    reader.readAsDataURL(file);
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

    setImage(canvas.toDataURL("image/png"));
    stopCamera();
    setActiveTab("preview");
  };

  // Process the image with OpenCV
  const processImage = async () => {
    if (!image || !isOpenCVReady || !previewCanvasRef.current) {
      toast({
        title: "Error",
        description: "Image or OpenCV not ready. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setProcessingStatus("processing");
    setIsProcessing(true);

    try {
      // Create an image element to load the image data
      const imgElement = document.createElement("img");
      imgElement.src = image;

      // Wait for the image to load
      await new Promise((resolve) => {
        imgElement.onload = resolve;
      });

      // Draw the image to the preview canvas
      const canvas = previewCanvasRef.current;
      canvas.width = imgElement.width;
      canvas.height = imgElement.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get canvas context");

      ctx.drawImage(imgElement, 0, 0);

      // Get image data for processing
      // const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Process with OpenCV
      // const processedData = detectStaffLines(imageData);

      // Draw the processed image back to the canvas
      // ctx.putImageData(processedData, 0, 0);

      // Save the processed image
      const processedImageUrl = canvas.toDataURL("image/png");

      // Add to store
      const id = addSheetMusic({
        name: "Sheet Music " + new Date().toLocaleString(),
        imageUrl: processedImageUrl,
        status: "scanned"
      });

      setProcessingStatus("success");

      // Navigate to editor with the new ID
      setTimeout(() => {
        router.push(`/editor?id=${id}`);
      }, 1500);
    } catch (error) {
      console.error("Error processing image:", error);
      setProcessingStatus("error");
      toast({
        title: "Processing Error",
        description: "Failed to process the image. Please try again.",
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
          <CardTitle>Capture or Upload</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="upload">Upload Image</TabsTrigger>
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
                  {isDragging ? "Drop your file here" : "Drop your image here or click to browse"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Supports JPG, PNG and PDF files
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
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
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              {image && (
                <div className="space-y-4">
                  <div className="relative w-full overflow-hidden rounded-md border">
                    <img
                      src={image}
                      alt="Uploaded sheet music"
                      className="w-full h-auto object-contain"
                    />
                  </div>
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setImage(null)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={processImage}
                      disabled={processingStatus === "processing"}
                    >
                      {processingStatus === "processing" && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Process Image
                    </Button>
                  </div>
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

      <Separator className="my-6" />

      <div className="prose dark:prose-invert max-w-none">
        <h2>Tips for best results</h2>
        <ul>
          <li>Ensure good lighting without shadows</li>
          <li>Avoid glare or reflections on the sheet music</li>
          <li>Position the sheet music flat and centered</li>
          <li>Capture the entire page in the frame</li>
          <li>Keep the camera steady when taking a photo</li>
        </ul>
      </div>

      {/* Hidden elements for processing */}
      <canvas ref={canvasRef} className="hidden" />
      <canvas ref={previewCanvasRef} className="hidden" />
    </div>
  );
}
"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { Camera } from "lucide-react";
import { detectDocumentEdges } from "@/lib/opencv/opencvSetup";
import { useToast } from "@/hooks/use-toast";

interface CameraCaptureProps {
  isOpenCVReady: boolean;
  onImageCaptured: (imageUrl: string, file: File) => void;
  onViewCaptured: () => void;
  capturedCount: number;
}

export function CameraCapture({
  isOpenCVReady,
  onImageCaptured,
  onViewCaptured,
  capturedCount
}: CameraCaptureProps) {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [detectedCorners, setDetectedCorners] = useState<{ x: number; y: number }[] | null>(null);
  const animationFrameRef = useRef<number>();

  // Process video frame
  const processVideoFrame = useCallback(() => {
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
  }, [isOpenCVReady]);

  // Start camera
  const startCamera = useCallback(async () => {
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
  }, [toast, processVideoFrame]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, [stream]);

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

    // Create a file from the canvas
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `scan-${Date.now()}.png`, { type: 'image/png' });
        onImageCaptured(capturedImageUrl, file);
      }
    });

    stopCamera();
  };

  // Start camera when component mounts
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  return (
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

      {capturedCount > 0 && (
        <Button
          className="w-full"
          variant="secondary"
          onClick={onViewCaptured}
        >
          View {capturedCount} Captured Images
        </Button>
      )}

      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />
    </TabsContent>
  );
}

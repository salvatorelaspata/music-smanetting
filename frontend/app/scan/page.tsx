"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useScanState } from "@/hooks/useScanState";
import { useOpenCV } from "@/hooks/useOpenCV";
import { useImageProcessing } from "@/hooks/useImageProcessing";
import { FileUpload, CameraCapture, ImagePreview, OpenCVStatus } from "@/components/scan";

export default function ScanPage() {
  const [activeTab, setActiveTab] = useState("upload");

  const [state, actions] = useScanState();
  const { isOpenCVReady } = useOpenCV();
  const { processImages: processImagesHandler } = useImageProcessing();

  // Handle file upload
  const handleFilesUploaded = (files: File[], imageUrls: string[]) => {
    actions.addImages(files, imageUrls);
    setActiveTab("preview");
  };

  // Handle camera capture
  const handleImageCaptured = (imageUrl: string, file: File) => {
    actions.addImages([file], [imageUrl]);
    setActiveTab("preview");
  };

  // Handle add more pages
  const handleAddMorePages = () => {
    setActiveTab(state.imagePreviewUrls.length > 0 ? "upload" : "camera");
  };

  // Process the images
  const processImages = async () => {
    await processImagesHandler(state.imagePreviewUrls, isOpenCVReady, actions.setProcessingStatus);
  };

  const handleClearAll = () => {
    actions.clearAll();
    setActiveTab("upload");
  };

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

            <FileUpload
              onFilesUploaded={handleFilesUploaded}
              onViewUploaded={() => setActiveTab("preview")}
              uploadedCount={state.imagePreviewUrls.length}
            />

            {activeTab === "camera" && (
              <CameraCapture
                isOpenCVReady={isOpenCVReady}
                onImageCaptured={handleImageCaptured}
                onViewCaptured={() => setActiveTab("preview")}
                capturedCount={state.imagePreviewUrls.length}
              />
            )}

            <ImagePreview
              imageUrls={state.imagePreviewUrls}
              currentPreviewIndex={state.currentPreviewIndex}
              onPreviewIndexChange={actions.setCurrentPreviewIndex}
              onRemovePage={actions.removePage}
              onMovePageLeft={actions.movePageLeft}
              onMovePageRight={actions.movePageRight}
              onAddMorePages={handleAddMorePages}
              onClearAll={handleClearAll}
              onProcess={processImages}
              processingStatus={state.processingStatus}
            />
          </Tabs>
        </CardContent>
        <OpenCVStatus isReady={isOpenCVReady} />
      </Card>
    </div>
  );
}
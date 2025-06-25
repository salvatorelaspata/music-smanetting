"use client";

import { useState } from "react";

interface UseScanState {
  imageFiles: File[];
  imagePreviewUrls: string[];
  currentPreviewIndex: number;
  processingStatus: "idle" | "processing" | "success" | "error";
  isDragging: boolean;
}

interface UseScanActions {
  addImages: (files: File[], urls: string[]) => void;
  removePage: (index: number) => void;
  movePageLeft: (index: number) => void;
  movePageRight: (index: number) => void;
  clearAll: () => void;
  setProcessingStatus: (status: "idle" | "processing" | "success" | "error") => void;
  setIsDragging: (isDragging: boolean) => void;
  setCurrentPreviewIndex: (index: number) => void;
}

export function useScanState(): [UseScanState, UseScanActions] {
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [processingStatus, setProcessingStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [isDragging, setIsDragging] = useState(false);

  const addImages = (files: File[], urls: string[]) => {
    setImageFiles(prevFiles => [...prevFiles, ...files]);
    setImagePreviewUrls(prevUrls => [...prevUrls, ...urls]);
  };

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

  const clearAll = () => {
    setImageFiles([]);
    setImagePreviewUrls([]);
    setCurrentPreviewIndex(0);
  };

  const state: UseScanState = {
    imageFiles,
    imagePreviewUrls,
    currentPreviewIndex,
    processingStatus,
    isDragging,
  };

  const actions: UseScanActions = {
    addImages,
    removePage,
    movePageLeft,
    movePageRight,
    clearAll,
    setProcessingStatus,
    setIsDragging,
    setCurrentPreviewIndex,
  };

  return [state, actions];
}

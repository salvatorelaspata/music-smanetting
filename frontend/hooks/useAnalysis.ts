"use client";

import { useState, useCallback } from "react";
import { useSheetMusicStore } from "@/lib/store/useSheetMusicStore";
import { AnalysisData } from "@/types/analysis";

export function useAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { currentSheetMusic, updateSheetMusic } = useSheetMusicStore();

  const performAnalysis = useCallback(async () => {
    if (!currentSheetMusic) return;

    setIsAnalyzing(true);

    try {
      // We'll analyze the first page for now, but in a full implementation
      // we would analyze all pages and combine the results
      const firstPage = currentSheetMusic.pages[0];

      // Create a temporary canvas to get image data
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Create an image to load the current sheet music
      const img = new Image();
      img.src = firstPage.imageUrl;

      // Wait for the image to load
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      // Set canvas size and draw image
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);

      // Get image data for analysis
      const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);

      // Simulate delay for processing
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock analysis data
      const analysisData: AnalysisData = {
        key: "G Major",
        timeSignature: "4/4",
        tempo: 120,
        measures: 16,
        notes: [
          { type: "quarter", count: 32 },
          { type: "eighth", count: 48 },
          { type: "half", count: 16 },
          { type: "whole", count: 4 },
          { type: "sixteenth", count: 24 }
        ]
      };

      // Update the sheet music with analysis data
      updateSheetMusic(currentSheetMusic.id, {
        analysis: analysisData,
        status: "analyzed"
      });

    } catch (error) {
      console.error("Analysis error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [currentSheetMusic, updateSheetMusic]);

  return {
    isAnalyzing,
    performAnalysis
  };
}

"use client";

import cv from "opencv-ts";

declare global {
  interface Window {
    onOpenCvReady?: () => void;
  }
}

let isLoaded = false;

/**
 * Initialize OpenCV.js
 * @returns Promise that resolves when OpenCV is loaded and ready
 */
export function initOpenCV(): Promise<void> {
  return new Promise((resolve, reject) => {
    // If already loaded, resolve immediately
    if (isLoaded) {
      return resolve();
    }

    try {
      // Check if opencv-ts module is available and ready
      if (cv && typeof cv.Mat === 'function') {
        console.log('OpenCV is available via npm package');
        isLoaded = true;
        return resolve();
      }

      // If we reach here, it means the npm package is available but not fully initialized
      console.log('OpenCV npm package needs initialization');

      // Give it a small timeout to finish initializing
      const checkInterval = setInterval(() => {
        if (cv && typeof cv.Mat === 'function') {
          clearInterval(checkInterval);
          isLoaded = true;
          console.log('OpenCV initialized successfully');
          resolve();
        }
      }, 100);

      // Set a timeout for initialization
      setTimeout(() => {
        clearInterval(checkInterval);
        if (!isLoaded) {
          console.error('OpenCV initialization timed out');
          reject(new Error('OpenCV initialization timed out'));
        }
      }, 5001);
    } catch (error) {
      console.error('Error initializing OpenCV:', error);
      reject(error);
    }
  });
}

/**
 * Detect document edges in real-time video frame
 * @param imageData The ImageData from a canvas
 * @returns Object with processed ImageData and detected corners
 */
export function detectDocumentEdges(imageData: ImageData): {
  processedImageData: ImageData;
  corners: { x: number; y: number }[] | null;
} {
  const src = cv.matFromImageData(imageData);
  const dst = new cv.Mat();

  try {
    // Convert to grayscale
    cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);

    // Apply Gaussian blur
    const blurred = new cv.Mat();
    cv.GaussianBlur(dst, blurred, new cv.Size(5, 5), 0, 0, cv.BORDER_DEFAULT);

    // Apply Canny edge detection
    const edges = new cv.Mat();
    cv.Canny(blurred, edges, 75, 200);

    // Find contours
    const contours = new cv.MatVector();
    const hierarchy = new cv.Mat();
    cv.findContours(
      edges,
      contours,
      hierarchy,
      cv.RETR_EXTERNAL,
      cv.CHAIN_APPROX_SIMPLE
    );

    let corners: { x: number; y: number }[] | null = null;
    let maxArea = 0;

    // Find the largest rectangular contour
    for (let i = 0; i < contours.size(); i++) {
      const contour = contours.get(i);
      const area = cv.contourArea(contour);
      const perimeter = cv.arcLength(contour, true);
      const approx = new cv.Mat();

      cv.approxPolyDP(contour, approx, 0.02 * perimeter, true);

      // Check if the contour is roughly rectangular (4 corners)
      if (area > 1000 && approx.rows === 4 && area > maxArea) {
        maxArea = area;
        corners = [];

        // Extract corner points
        for (let j = 0; j < 4; j++) {
          corners.push({
            x: approx.data32S[j * 2],
            y: approx.data32S[j * 2 + 1]
          });
        }

        // Sort corners in clockwise order
        corners.sort((a, b) => a.y - b.y);
        if (corners[0].x > corners[1].x) {
          [corners[0], corners[1]] = [corners[1], corners[0]];
        }
        if (corners[2].x < corners[3].x) {
          [corners[2], corners[3]] = [corners[3], corners[2]];
        }
      }

      approx.delete();
    }

    // Draw detected edges on original image
    if (corners) {
      const color = new cv.Scalar(0, 255, 0, 255);
      for (let i = 0; i < 4; i++) {
        cv.line(
          src,
          new cv.Point(corners[i].x, corners[i].y),
          new cv.Point(corners[(i + 1) % 4].x, corners[(i + 1) % 4].y),
          color,
          3
        );
      }
    }

    // Clean up
    dst.delete();
    blurred.delete();
    edges.delete();
    contours.delete();
    hierarchy.delete();

    return {
      processedImageData: new ImageData(
        new Uint8ClampedArray(src.data),
        src.cols,
        src.rows
      ),
      corners
    };
  } finally {
    src.delete();
  }
}

/**
 * Process an image to detect staff lines 
 * @param imageData The ImageData from a canvas
 * @returns Processed ImageData with detected staff lines
 */
export function detectStaffLines(imageData: ImageData): ImageData {
  // Convert ImageData to Mat
  const src = cv.matFromImageData(imageData);

  // Create output Mat
  const dst = new cv.Mat();

  try {
    // Convert to grayscale
    cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);

    // Apply adaptive threshold to get binary image
    const thresholdMat = new cv.Mat();
    cv.adaptiveThreshold(
      dst,
      thresholdMat,
      255,
      cv.ADAPTIVE_THRESH_GAUSSIAN_C,
      cv.THRESH_BINARY_INV,
      11,
      2
    );

    // Use morphological operations to connect components
    const kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(20, 1), new cv.Point(-1, -1));
    const morphMat = new cv.Mat();
    cv.morphologyEx(
      thresholdMat,
      morphMat,
      cv.MORPH_CLOSE,
      kernel,
      new cv.Point(-1, -1),
      1,
      cv.BORDER_CONSTANT,
      cv.morphologyDefaultBorderValue()
    );

    // Find contours
    const contours = new cv.MatVector();
    const hierarchy = new cv.Mat();
    cv.findContours(
      morphMat,
      contours,
      hierarchy,
      cv.RETR_EXTERNAL,
      cv.CHAIN_APPROX_SIMPLE
    );

    // Draw contours on the original image
    const color = new cv.Scalar(0, 255, 0, 255);
    // const resultMat = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC4);
    for (let i = 0; i < contours.size(); i++) {
      // Filter contours by width/height ratio to find staff lines
      const rect = cv.boundingRect(contours.get(i));
      if (rect.width > rect.height * 5) {
        cv.drawContours(src, contours, i, color, 2);
      }
    }

    // Clean up
    thresholdMat.delete();
    morphMat.delete();
    contours.delete();
    hierarchy.delete();
    kernel.delete();

    // Return the processed image
    return new ImageData(
      new Uint8ClampedArray(src.data),
      src.cols,
      src.rows
    );
  } finally {
    src.delete();
    dst.delete();
  }
}

/**
 * Detect music notation elements like notes, clefs, etc.
 * @param imageData The ImageData from a canvas
 * @returns Object containing detected elements
 */
export function detectMusicNotation(imageData: ImageData): any {
  // Convert ImageData to Mat
  const src = cv.matFromImageData(imageData);

  // Create output Mat
  const dst = new cv.Mat();

  try {
    // Convert to grayscale
    cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);

    // Apply threshold
    const thresholdMat = new cv.Mat();
    cv.threshold(dst, thresholdMat, 0, 255, cv.THRESH_BINARY_INV | cv.THRESH_OTSU);

    // Find contours
    const contours = new cv.MatVector();
    const hierarchy = new cv.Mat();
    cv.findContours(
      thresholdMat,
      contours,
      hierarchy,
      cv.RETR_EXTERNAL,
      cv.CHAIN_APPROX_SIMPLE
    );

    // Array to store detected elements
    const detectedElements = [];

    // Process each contour to identify musical elements
    for (let i = 0; i < contours.size(); i++) {
      const contour = contours.get(i);
      const area = cv.contourArea(contour);
      const perimeter = cv.arcLength(contour, true);

      // Filter out very small contours
      if (area < 10) continue;

      // Get bounding rectangle
      const rect = cv.boundingRect(contour);

      // Calculate aspect ratio (width/height)
      const aspectRatio = rect.width / rect.height;

      // Detect different types of musical elements based on shape characteristics
      let elementType = 'unknown';

      // Example: Notes typically have circular heads
      if (0.8 < aspectRatio && aspectRatio < 1.2 && area / (Math.PI * (rect.width / 2) * (rect.height / 2)) > 0.7) {
        elementType = 'note_head';
      }
      // Example: Staff lines are wide and thin
      else if (aspectRatio > 5 && rect.height < 5) {
        elementType = 'staff_line';
      }
      // Example: Stems are tall and thin
      else if (aspectRatio < 0.2 && rect.height > 20) {
        elementType = 'stem';
      }

      detectedElements.push({
        type: elementType,
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        area: area,
        aspectRatio: aspectRatio
      });
    }

    // Clean up
    thresholdMat.delete();
    contours.delete();
    hierarchy.delete();

    return {
      elements: detectedElements,
      imageWidth: src.cols,
      imageHeight: src.rows
    };
  } finally {
    src.delete();
    dst.delete();
  }
}
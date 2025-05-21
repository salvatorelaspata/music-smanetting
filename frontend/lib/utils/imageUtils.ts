/**
 * Compresses an image by reducing its quality
 * 
 * @param dataUrl The image as a data URL
 * @param quality The quality factor (0-1)
 * @returns A promise that resolves to the compressed data URL
 */
export const compressImage = async (dataUrl: string, quality: number = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Create canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Set dimensions
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw image to canvas
      ctx.drawImage(img, 0, 0);

      // Get compressed data URL
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for compression'));
    };

    img.src = dataUrl;
  });
};

/**
 * Calculates the size of a data URL in bytes
 * 
 * @param dataUrl The data URL
 * @returns The size in bytes
 */
export const getDataUrlSize = (dataUrl: string): number => {
  // Remove metadata part (e.g. "data:image/png;base64,")
  const base64 = dataUrl.split(',')[1];

  // Calculate size: base64 encodes 3 bytes in 4 chars
  return Math.floor((base64.length * 3) / 4);
};

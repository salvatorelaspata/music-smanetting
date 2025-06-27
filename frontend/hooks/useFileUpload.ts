import { useCallback } from 'react';
import { useScanStore } from '../lib/store/useScanStore';

export interface UseFileUploadOptions {
  maxFileSize?: number; // in bytes
  maxFiles?: number;
  acceptedFileTypes?: string[];
  onError?: (error: string) => void;
  onSuccess?: (files: File[]) => void;
}

export function useFileUpload(options: UseFileUploadOptions = {}) {
  const {
    maxFileSize = 10 * 1024 * 1024, // 10MB default
    maxFiles = 20,
    acceptedFileTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/tiff'],
    onError,
    onSuccess,
  } = options;

  const { files, addFiles, setError } = useScanStore();

  const validateFiles = useCallback((filesToValidate: File[]): { valid: File[]; errors: string[] } => {
    const valid: File[] = [];
    const errors: string[] = [];

    // Check total files limit
    if (files.length + filesToValidate.length > maxFiles) {
      errors.push(`Maximum ${maxFiles} files allowed. Current: ${files.length}, trying to add: ${filesToValidate.length}`);
      return { valid, errors };
    }

    filesToValidate.forEach((file) => {
      // Check file type
      if (!acceptedFileTypes.includes(file.type)) {
        errors.push(`File "${file.name}" has unsupported type: ${file.type}`);
        return;
      }

      // Check file size
      if (file.size > maxFileSize) {
        const maxSizeMB = (maxFileSize / (1024 * 1024)).toFixed(1);
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
        errors.push(`File "${file.name}" is too large: ${fileSizeMB}MB (max: ${maxSizeMB}MB)`);
        return;
      }

      // Check for duplicates (by name and size)
      const isDuplicate = files.some(existingFile =>
        existingFile.file.name === file.name && existingFile.file.size === file.size
      );

      if (isDuplicate) {
        errors.push(`File "${file.name}" is already added`);
        return;
      }

      valid.push(file);
    });

    return { valid, errors };
  }, [files, maxFiles, maxFileSize, acceptedFileTypes]);

  const uploadFiles = useCallback(async (filesToUpload: File[]) => {
    const { valid, errors } = validateFiles(filesToUpload);

    if (errors.length > 0) {
      const errorMessage = errors.join('; ');
      setError(errorMessage);
      onError?.(errorMessage);
      return false;
    }

    if (valid.length === 0) {
      return false;
    }

    try {
      await addFiles(valid);
      onSuccess?.(valid);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error uploading files';
      setError(errorMessage);
      onError?.(errorMessage);
      return false;
    }
  }, [validateFiles, addFiles, setError, onError, onSuccess]);

  const handleFileInput = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return false;

    const filesArray = Array.from(fileList);
    const success = await uploadFiles(filesArray);

    // Reset input
    event.target.value = '';

    return success;
  }, [uploadFiles]);

  const handleDrop = useCallback(async (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();

    const fileList = event.dataTransfer.files;
    if (!fileList || fileList.length === 0) return false;

    const filesArray = Array.from(fileList);
    return await uploadFiles(filesArray);
  }, [uploadFiles]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
  }, []);

  const getFileStats = useCallback(() => {
    const totalSize = files.reduce((sum, file) => sum + file.file.size, 0);
    const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(1);

    return {
      count: files.length,
      maxCount: maxFiles,
      totalSize,
      totalSizeMB,
      canAddMore: files.length < maxFiles,
      remainingSlots: maxFiles - files.length,
    };
  }, [files, maxFiles]);

  return {
    uploadFiles,
    handleFileInput,
    handleDrop,
    handleDragOver,
    validateFiles,
    getFileStats,
    // Computed values
    canUpload: files.length < maxFiles,
    acceptedTypes: acceptedFileTypes.join(','),
  };
}

// Hook specifico per drag & drop
export function useDragAndDrop() {
  const { setIsDragging } = useScanStore();
  const fileUpload = useFileUpload();

  const handleDragEnter = useCallback((event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    setIsDragging(true);
  }, [setIsDragging]);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    // Only set to false if we're leaving the drop zone completely
    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, [setIsDragging]);

  const handleDrop = useCallback(async (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    setIsDragging(false);
    return await fileUpload.handleDrop(event);
  }, [setIsDragging, fileUpload]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
  }, []);

  return {
    ...fileUpload,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    handleDragOver,
  };
}

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ScanFile {
  id: string;
  file: File;
  previewUrl: string;
  uploadProgress?: number;
  processed?: boolean;
}

export interface ScanState {
  // Files management
  files: ScanFile[];
  currentPreviewIndex: number;

  // Processing status
  processingStatus: 'idle' | 'processing' | 'success' | 'error';
  processingProgress?: number;

  // UI state
  isDragging: boolean;
  isUploading: boolean;

  // Error handling
  error?: string;
}

export interface ScanActions {
  // File operations
  addFiles: (files: File[]) => Promise<void>;
  removeFile: (id: string) => void;
  moveFile: (fromIndex: number, toIndex: number) => void;
  moveFileLeft: (index: number) => void;
  moveFileRight: (index: number) => void;
  clearAllFiles: () => void;
  updateFileProgress: (id: string, progress: number) => void;
  markFileAsProcessed: (id: string) => void;

  // Preview management
  setCurrentPreviewIndex: (index: number) => void;
  goToNextPreview: () => void;
  goToPreviousPreview: () => void;

  // Status management
  setProcessingStatus: (status: ScanState['processingStatus']) => void;
  setProcessingProgress: (progress: number | undefined) => void;
  setIsDragging: (isDragging: boolean) => void;
  setIsUploading: (isUploading: boolean) => void;
  setError: (error: string | undefined) => void;

  // Utility actions
  reset: () => void;
  getFileById: (id: string) => ScanFile | undefined;
  getTotalFileSize: () => number;
  getProcessedFilesCount: () => number;
}

const initialState: ScanState = {
  files: [],
  currentPreviewIndex: 0,
  processingStatus: 'idle',
  isDragging: false,
  isUploading: false,
};

export const useScanStore = create<ScanState & ScanActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // File operations
      addFiles: async (newFiles: File[]) => {
        try {
          set({ isUploading: true, error: undefined });

          const scanFiles: ScanFile[] = await Promise.all(
            newFiles.map(async (file) => {
              // Validate file
              if (!file.type.startsWith('image/')) {
                throw new Error(`File ${file.name} is not a valid image`);
              }

              // Create preview URL
              const previewUrl = URL.createObjectURL(file);

              return {
                id: crypto.randomUUID(),
                file,
                previewUrl,
                uploadProgress: 0,
                processed: false,
              };
            })
          );

          set((state) => ({
            files: [...state.files, ...scanFiles],
            isUploading: false,
          }));
        } catch (error) {
          set({
            isUploading: false,
            error: error instanceof Error ? error.message : 'Error adding files'
          });
        }
      },

      removeFile: (id: string) => {
        const state = get();
        const fileIndex = state.files.findIndex(f => f.id === id);

        if (fileIndex === -1) return;

        // Revoke the object URL to prevent memory leaks
        const file = state.files[fileIndex];
        URL.revokeObjectURL(file.previewUrl);

        // Remove file and adjust preview index if necessary
        const newFiles = state.files.filter(f => f.id !== id);
        let newCurrentPreviewIndex = state.currentPreviewIndex;

        if (fileIndex <= state.currentPreviewIndex && state.currentPreviewIndex > 0) {
          newCurrentPreviewIndex = state.currentPreviewIndex - 1;
        } else if (newFiles.length === 0) {
          newCurrentPreviewIndex = 0;
        } else if (state.currentPreviewIndex >= newFiles.length) {
          newCurrentPreviewIndex = newFiles.length - 1;
        }

        set({
          files: newFiles,
          currentPreviewIndex: newCurrentPreviewIndex,
        });
      },

      moveFile: (fromIndex: number, toIndex: number) => {
        const state = get();
        if (fromIndex < 0 || fromIndex >= state.files.length ||
          toIndex < 0 || toIndex >= state.files.length) {
          return;
        }

        const newFiles = [...state.files];
        const [movedFile] = newFiles.splice(fromIndex, 1);
        newFiles.splice(toIndex, 0, movedFile);

        // Update current preview index if it's affected
        let newCurrentPreviewIndex = state.currentPreviewIndex;
        if (state.currentPreviewIndex === fromIndex) {
          newCurrentPreviewIndex = toIndex;
        } else if (fromIndex < state.currentPreviewIndex && toIndex >= state.currentPreviewIndex) {
          newCurrentPreviewIndex = state.currentPreviewIndex - 1;
        } else if (fromIndex > state.currentPreviewIndex && toIndex <= state.currentPreviewIndex) {
          newCurrentPreviewIndex = state.currentPreviewIndex + 1;
        }

        set({
          files: newFiles,
          currentPreviewIndex: newCurrentPreviewIndex,
        });
      },

      moveFileLeft: (index: number) => {
        if (index > 0) {
          get().moveFile(index, index - 1);
        }
      },

      moveFileRight: (index: number) => {
        const state = get();
        if (index < state.files.length - 1) {
          get().moveFile(index, index + 1);
        }
      },

      clearAllFiles: () => {
        const state = get();
        // Revoke all object URLs
        state.files.forEach(file => {
          URL.revokeObjectURL(file.previewUrl);
        });

        set({
          files: [],
          currentPreviewIndex: 0,
          processingStatus: 'idle',
          processingProgress: undefined,
          error: undefined,
        });
      },

      updateFileProgress: (id: string, progress: number) => {
        set((state) => ({
          files: state.files.map(file =>
            file.id === id ? { ...file, uploadProgress: progress } : file
          ),
        }));
      },

      markFileAsProcessed: (id: string) => {
        set((state) => ({
          files: state.files.map(file =>
            file.id === id ? { ...file, processed: true } : file
          ),
        }));
      },

      // Preview management
      setCurrentPreviewIndex: (index: number) => {
        const state = get();
        if (index >= 0 && index < state.files.length) {
          set({ currentPreviewIndex: index });
        }
      },

      goToNextPreview: () => {
        const state = get();
        if (state.currentPreviewIndex < state.files.length - 1) {
          set({ currentPreviewIndex: state.currentPreviewIndex + 1 });
        }
      },

      goToPreviousPreview: () => {
        const state = get();
        if (state.currentPreviewIndex > 0) {
          set({ currentPreviewIndex: state.currentPreviewIndex - 1 });
        }
      },

      // Status management
      setProcessingStatus: (status: ScanState['processingStatus']) => {
        set({ processingStatus: status });
      },

      setProcessingProgress: (progress: number | undefined) => {
        if (progress === undefined) {
          set({ processingProgress: undefined });
        } else {
          set({ processingProgress: Math.max(0, Math.min(100, progress)) });
        }
      },

      setIsDragging: (isDragging: boolean) => {
        set({ isDragging });
      },

      setIsUploading: (isUploading: boolean) => {
        set({ isUploading });
      },

      setError: (error: string | undefined) => {
        set({ error });
      },

      // Utility actions
      reset: () => {
        const state = get();
        // Revoke all object URLs
        state.files.forEach(file => {
          URL.revokeObjectURL(file.previewUrl);
        });

        set(initialState);
      },

      getFileById: (id: string) => {
        return get().files.find(file => file.id === id);
      },

      getTotalFileSize: () => {
        return get().files.reduce((total, file) => total + file.file.size, 0);
      },

      getProcessedFilesCount: () => {
        return get().files.filter(file => file.processed).length;
      },
    }),
    {
      name: 'scan-storage',
      // Solo persiste alcuni campi, non i file o le preview URLs
      partialize: (state) => ({
        processingStatus: state.processingStatus,
        currentPreviewIndex: state.currentPreviewIndex,
      }),
    }
  )
);

// Selectors per performance ottimizzate
export const useScanFiles = () => useScanStore((state) => state.files);
export const useScanCurrentPreview = () => useScanStore((state) => {
  const { files, currentPreviewIndex } = state;
  return files[currentPreviewIndex] || null;
});
export const useScanStatus = () => useScanStore((state) => ({
  processingStatus: state.processingStatus,
  processingProgress: state.processingProgress,
  isDragging: state.isDragging,
  isUploading: state.isUploading,
  error: state.error,
}));
export const useScanStats = () => useScanStore((state) => ({
  totalFiles: state.files.length,
  processedFiles: state.getProcessedFilesCount(),
  totalSize: state.getTotalFileSize(),
}));

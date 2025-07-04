"use client";

// Deprecato: Usa useScanStore direttamente o useScanStateV2 per nuove implementazioni
import { useScanStore, ScanFile } from "../lib/store/useScanStore";

interface UseScanState {
  imageFiles: File[];
  imagePreviewUrls: string[];
  currentPreviewIndex: number;
  processingStatus: "idle" | "processing" | "success" | "error";
  isDragging: boolean;
}

interface UseScanActions {
  addImages: (files: File[], urls?: string[]) => Promise<void>;
  removePage: (index: number) => void;
  movePageLeft: (index: number) => void;
  movePageRight: (index: number) => void;
  clearAll: () => void;
  setProcessingStatus: (status: "idle" | "processing" | "success" | "error") => void;
  setIsDragging: (isDragging: boolean) => void;
  setCurrentPreviewIndex: (index: number) => void;
}

/**
 * @deprecated Usa useScanStore direttamente per migliori performance e funzionalità
 * Questo hook mantiene la compatibilità con il codice esistente
 */
export function useScanState(): [UseScanState, UseScanActions] {
  const store = useScanStore();

  // Trasforma i dati dello store nel formato atteso
  const state: UseScanState = {
    imageFiles: store.files.map((f: ScanFile) => f.file),
    imagePreviewUrls: store.files.map((f: ScanFile) => f.previewUrl),
    currentPreviewIndex: store.currentPreviewIndex,
    processingStatus: store.processingStatus,
    isDragging: store.isDragging,
  };

  const actions: UseScanActions = {
    addImages: async (files: File[], urls?: string[]) => {
      // Il nuovo store gestisce automaticamente la creazione delle preview URLs
      await store.addFiles(files);
    },

    removePage: (index: number) => {
      const file = store.files[index];
      if (file) {
        store.removeFile(file.id);
      }
    },

    movePageLeft: (index: number) => {
      store.moveFileLeft(index);
    },

    movePageRight: (index: number) => {
      store.moveFileRight(index);
    },

    clearAll: () => {
      store.clearAllFiles();
    },

    setProcessingStatus: (status: "idle" | "processing" | "success" | "error") => {
      store.setProcessingStatus(status);
    },

    setIsDragging: (isDragging: boolean) => {
      store.setIsDragging(isDragging);
    },

    setCurrentPreviewIndex: (index: number) => {
      store.setCurrentPreviewIndex(index);
    },
  };

  return [state, actions];
}

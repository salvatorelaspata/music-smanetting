import { useScanStore, ScanFile } from '../lib/store/useScanStore';

/**
 * Hook di compatibilità per facilitare la migrazione da useScanState al nuovo useScanStore
 * Mantiene la stessa interfaccia del vecchio hook per evitare breaking changes
 */
export function useScanState() {
  const store = useScanStore();

  // Trasforma i dati dello store nel formato atteso dal vecchio hook
  const state = {
    imageFiles: store.files.map((f: ScanFile) => f.file),
    imagePreviewUrls: store.files.map((f: ScanFile) => f.previewUrl),
    currentPreviewIndex: store.currentPreviewIndex,
    processingStatus: store.processingStatus,
    isDragging: store.isDragging,
  };

  const actions = {
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

  return [state, actions] as const;
}

/**
 * Hook ottimizzato che espone direttamente le funzionalità del nuovo store
 * Da usare per nuovi componenti o quando si migra completamente
 */
export function useScanStateV2() {
  return useScanStore();
}

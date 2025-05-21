import { create } from 'zustand';
// import { persist } from 'zustand/middleware';

export interface SheetMusicPage {
  id: string;
  imageUrl: string;
  annotations?: Array<{
    id: string;
    text: string;
    position: { x: number; y: number };
  }>;
}

export interface SheetMusic {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'scanned' | 'edited' | 'analyzed';
  pages: SheetMusicPage[];
  currentPageIndex: number;
  notes?: any[];
  analysis?: {
    key?: string;
    timeSignature?: string;
    tempo?: number;
    measures?: number;
    notes?: { type: string; count: number }[];
  };
}

interface SheetMusicState {
  sheetMusics: SheetMusic[];
  currentSheetMusic: SheetMusic | null;
  isScanning: boolean;
  isProcessing: boolean;

  addSheetMusic: (sheetMusic: { name: string, pages: { imageUrl: string }[] }) => string;
  setCurrentSheetMusic: (id: string | null) => void;
  updateSheetMusic: (id: string, updates: Partial<SheetMusic>) => void;
  deleteSheetMusic: (id: string) => void;
  setIsScanning: (isScanning: boolean) => void;
  setIsProcessing: (isProcessing: boolean) => void;
  addAnnotation: (id: string, pageId: string, text: string, position: { x: number; y: number }) => void;
  updateAnnotation: (sheetMusicId: string, pageId: string, annotationId: string, text: string) => void;
  deleteAnnotation: (sheetMusicId: string, pageId: string, annotationId: string) => void;
  setCurrentPageIndex: (sheetMusicId: string, pageIndex: number) => void;
  addPage: (sheetMusicId: string, imageUrl: string) => void;
  deletePage: (sheetMusicId: string, pageId: string) => void;
  reorderPages: (sheetMusicId: string, newOrder: string[]) => void;
}

export const useSheetMusicStore = create<SheetMusicState>()(
  // persist(
  (set, get) => ({
    sheetMusics: [],
    currentSheetMusic: null,
    isScanning: false,
    isProcessing: false,

    addSheetMusic: (sheetMusic) => {
      const id = crypto.randomUUID();
      const now = new Date();

      // Create page objects with IDs for each uploaded image
      const pages = sheetMusic.pages.map(page => ({
        id: crypto.randomUUID(),
        imageUrl: page.imageUrl,
        annotations: []
      }));

      const newSheetMusic = {
        ...sheetMusic,
        id,
        pages,
        currentPageIndex: 0,
        createdAt: now,
        updatedAt: now,
        status: 'scanned' as const,
      };

      set((state) => ({
        sheetMusics: [...state.sheetMusics, newSheetMusic],
        currentSheetMusic: newSheetMusic,
      }));

      return id;
    },

    setCurrentSheetMusic: (id) => {
      if (id === null) {
        set({ currentSheetMusic: null });
        return;
      }

      const sheetMusic = get().sheetMusics.find((sm) => sm.id === id);
      if (sheetMusic) {
        set({ currentSheetMusic: sheetMusic });
      }
    },

    updateSheetMusic: (id, updates) => {
      set((state) => ({
        sheetMusics: state.sheetMusics.map((sm) =>
          sm.id === id
            ? { ...sm, ...updates, updatedAt: new Date() }
            : sm
        ),
        currentSheetMusic:
          state.currentSheetMusic?.id === id
            ? { ...state.currentSheetMusic, ...updates, updatedAt: new Date() }
            : state.currentSheetMusic,
      }));
    },

    deleteSheetMusic: (id) => {
      set((state) => ({
        sheetMusics: state.sheetMusics.filter((sm) => sm.id !== id),
        currentSheetMusic:
          state.currentSheetMusic?.id === id ? null : state.currentSheetMusic,
      }));
    },

    setIsScanning: (isScanning) => set({ isScanning }),

    setIsProcessing: (isProcessing) => set({ isProcessing }),

    addAnnotation: (id, pageId, text, position) => {
      const annotationId = crypto.randomUUID();

      set((state) => ({
        sheetMusics: state.sheetMusics.map((sm) =>
          sm.id === id
            ? {
              ...sm,
              pages: sm.pages.map(page =>
                page.id === pageId
                  ? {
                    ...page,
                    annotations: [
                      ...(page.annotations || []),
                      { id: annotationId, text, position },
                    ],
                  }
                  : page
              ),
              updatedAt: new Date(),
            }
            : sm
        ),
        currentSheetMusic:
          state.currentSheetMusic?.id === id
            ? {
              ...state.currentSheetMusic,
              pages: state.currentSheetMusic.pages.map(page =>
                page.id === pageId
                  ? {
                    ...page,
                    annotations: [
                      ...(page.annotations || []),
                      { id: annotationId, text, position },
                    ],
                  }
                  : page
              ),
              updatedAt: new Date(),
            }
            : state.currentSheetMusic,
      }));
    },

    updateAnnotation: (sheetMusicId, pageId, annotationId, text) => {
      set((state) => ({
        sheetMusics: state.sheetMusics.map((sm) =>
          sm.id === sheetMusicId
            ? {
              ...sm,
              pages: sm.pages.map(page =>
                page.id === pageId
                  ? {
                    ...page,
                    annotations: (page.annotations || []).map((ann) =>
                      ann.id === annotationId ? { ...ann, text } : ann
                    ),
                  }
                  : page
              ),
              updatedAt: new Date(),
            }
            : sm
        ),
        currentSheetMusic:
          state.currentSheetMusic?.id === sheetMusicId
            ? {
              ...state.currentSheetMusic,
              pages: state.currentSheetMusic.pages.map(page =>
                page.id === pageId
                  ? {
                    ...page,
                    annotations: (page.annotations || []).map((ann) =>
                      ann.id === annotationId ? { ...ann, text } : ann
                    ),
                  }
                  : page
              ),
              updatedAt: new Date(),
            }
            : state.currentSheetMusic,
      }));
    },

    deleteAnnotation: (sheetMusicId, pageId, annotationId) => {
      set((state) => ({
        sheetMusics: state.sheetMusics.map((sm) =>
          sm.id === sheetMusicId
            ? {
              ...sm,
              pages: sm.pages.map(page =>
                page.id === pageId
                  ? {
                    ...page,
                    annotations: (page.annotations || []).filter(
                      (ann) => ann.id !== annotationId
                    ),
                  }
                  : page
              ),
              updatedAt: new Date(),
            }
            : sm
        ),
        currentSheetMusic:
          state.currentSheetMusic?.id === sheetMusicId
            ? {
              ...state.currentSheetMusic,
              pages: state.currentSheetMusic.pages.map(page =>
                page.id === pageId
                  ? {
                    ...page,
                    annotations: (page.annotations || []).filter(
                      (ann) => ann.id !== annotationId
                    ),
                  }
                  : page
              ),
              updatedAt: new Date(),
            }
            : state.currentSheetMusic,
      }));
    },

    setCurrentPageIndex: (sheetMusicId, pageIndex) => {
      set((state) => ({
        sheetMusics: state.sheetMusics.map((sm) =>
          sm.id === sheetMusicId
            ? { ...sm, currentPageIndex: pageIndex }
            : sm
        ),
        currentSheetMusic:
          state.currentSheetMusic?.id === sheetMusicId
            ? { ...state.currentSheetMusic, currentPageIndex: pageIndex }
            : state.currentSheetMusic,
      }));
    },

    addPage: (sheetMusicId, imageUrl) => {
      const pageId = crypto.randomUUID();

      set((state) => ({
        sheetMusics: state.sheetMusics.map((sm) =>
          sm.id === sheetMusicId
            ? {
              ...sm,
              pages: [...sm.pages, { id: pageId, imageUrl, annotations: [] }],
              updatedAt: new Date(),
            }
            : sm
        ),
        currentSheetMusic:
          state.currentSheetMusic?.id === sheetMusicId
            ? {
              ...state.currentSheetMusic,
              pages: [...state.currentSheetMusic.pages, { id: pageId, imageUrl, annotations: [] }],
              updatedAt: new Date(),
            }
            : state.currentSheetMusic,
      }));
    },

    deletePage: (sheetMusicId, pageId) => {
      set((state) => {
        const sheetMusic = state.sheetMusics.find(sm => sm.id === sheetMusicId);
        if (!sheetMusic || sheetMusic.pages.length <= 1) {
          return state; // Don't delete the last page
        }

        // Calculate new currentPageIndex if needed
        const newPages = sheetMusic.pages.filter(page => page.id !== pageId);
        const currentPageIndex = Math.min(sheetMusic.currentPageIndex, newPages.length - 1);

        return {
          sheetMusics: state.sheetMusics.map((sm) =>
            sm.id === sheetMusicId
              ? {
                ...sm,
                pages: newPages,
                currentPageIndex,
                updatedAt: new Date(),
              }
              : sm
          ),
          currentSheetMusic:
            state.currentSheetMusic?.id === sheetMusicId
              ? {
                ...state.currentSheetMusic,
                pages: newPages,
                currentPageIndex,
                updatedAt: new Date(),
              }
              : state.currentSheetMusic,
        };
      });
    },

    reorderPages: (sheetMusicId, newOrder) => {
      set((state) => {
        const sheetMusic = state.sheetMusics.find(sm => sm.id === sheetMusicId);
        if (!sheetMusic) return state;

        // Create a map of pages by ID for efficient lookup
        const pagesMap = Object.fromEntries(
          sheetMusic.pages.map(page => [page.id, page])
        );

        // Create new pages array in the specified order
        const reorderedPages = newOrder
          .map(id => pagesMap[id])
          .filter(Boolean); // Filter out any invalid IDs

        return {
          sheetMusics: state.sheetMusics.map((sm) =>
            sm.id === sheetMusicId
              ? {
                ...sm,
                pages: reorderedPages,
                updatedAt: new Date(),
              }
              : sm
          ),
          currentSheetMusic:
            state.currentSheetMusic?.id === sheetMusicId
              ? {
                ...state.currentSheetMusic,
                pages: reorderedPages,
                updatedAt: new Date(),
              }
              : state.currentSheetMusic,
        };
      });
    },
  }),
  //   {
  //     name: 'sheet-music-storage',
  //   }
  // )
);
import { create } from 'zustand';
// import { persist } from 'zustand/middleware';

export interface SheetMusic {
  id: string;
  name: string;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'scanned' | 'edited' | 'analyzed';
  notes?: any[];
  analysis?: {
    key?: string;
    timeSignature?: string;
    tempo?: number;
    measures?: number;
    notes?: { type: string; count: number }[];
  };
  annotations?: Array<{
    id: string;
    text: string;
    position: { x: number; y: number };
  }>;
}

interface SheetMusicState {
  sheetMusics: SheetMusic[];
  currentSheetMusic: SheetMusic | null;
  isScanning: boolean;
  isProcessing: boolean;

  addSheetMusic: (sheetMusic: Omit<SheetMusic, 'id' | 'createdAt' | 'updatedAt'>) => string;
  setCurrentSheetMusic: (id: string | null) => void;
  updateSheetMusic: (id: string, updates: Partial<SheetMusic>) => void;
  deleteSheetMusic: (id: string) => void;
  setIsScanning: (isScanning: boolean) => void;
  setIsProcessing: (isProcessing: boolean) => void;
  addAnnotation: (id: string, text: string, position: { x: number; y: number }) => void;
  updateAnnotation: (sheetMusicId: string, annotationId: string, text: string) => void;
  deleteAnnotation: (sheetMusicId: string, annotationId: string) => void;
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

      set((state) => ({
        sheetMusics: [
          ...state.sheetMusics,
          {
            ...sheetMusic,
            id,
            createdAt: now,
            updatedAt: now,
          },
        ],
        currentSheetMusic: {
          ...sheetMusic,
          id,
          createdAt: now,
          updatedAt: now,
        },
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

    addAnnotation: (id, text, position) => {
      const annotationId = crypto.randomUUID();

      set((state) => ({
        sheetMusics: state.sheetMusics.map((sm) =>
          sm.id === id
            ? {
              ...sm,
              annotations: [
                ...(sm.annotations || []),
                { id: annotationId, text, position },
              ],
              updatedAt: new Date(),
            }
            : sm
        ),
        currentSheetMusic:
          state.currentSheetMusic?.id === id
            ? {
              ...state.currentSheetMusic,
              annotations: [
                ...(state.currentSheetMusic.annotations || []),
                { id: annotationId, text, position },
              ],
              updatedAt: new Date(),
            }
            : state.currentSheetMusic,
      }));
    },

    updateAnnotation: (sheetMusicId, annotationId, text) => {
      set((state) => ({
        sheetMusics: state.sheetMusics.map((sm) =>
          sm.id === sheetMusicId
            ? {
              ...sm,
              annotations: (sm.annotations || []).map((ann) =>
                ann.id === annotationId ? { ...ann, text } : ann
              ),
              updatedAt: new Date(),
            }
            : sm
        ),
        currentSheetMusic:
          state.currentSheetMusic?.id === sheetMusicId
            ? {
              ...state.currentSheetMusic,
              annotations: (state.currentSheetMusic.annotations || []).map((ann) =>
                ann.id === annotationId ? { ...ann, text } : ann
              ),
              updatedAt: new Date(),
            }
            : state.currentSheetMusic,
      }));
    },

    deleteAnnotation: (sheetMusicId, annotationId) => {
      set((state) => ({
        sheetMusics: state.sheetMusics.map((sm) =>
          sm.id === sheetMusicId
            ? {
              ...sm,
              annotations: (sm.annotations || []).filter(
                (ann) => ann.id !== annotationId
              ),
              updatedAt: new Date(),
            }
            : sm
        ),
        currentSheetMusic:
          state.currentSheetMusic?.id === sheetMusicId
            ? {
              ...state.currentSheetMusic,
              annotations: (state.currentSheetMusic.annotations || []).filter(
                (ann) => ann.id !== annotationId
              ),
              updatedAt: new Date(),
            }
            : state.currentSheetMusic,
      }));
    },
  }),
  //   {
  //     name: 'sheet-music-storage',
  //   }
  // )
);
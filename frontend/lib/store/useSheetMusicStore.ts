import { create } from 'zustand';
import {
  getAllSheetMusic,
  getSheetMusicById,
  createSheetMusic,
  updateSheetMusic as apiUpdateSheetMusic,
  deleteSheetMusic as apiDeleteSheetMusic,
} from '../api';

// ... (interfacce SheetMusicPage e SheetMusic invariate) ...

interface SheetMusicState {
  sheetMusics: SheetMusic[];
  currentSheetMusic: SheetMusic | null;
  isLoading: boolean;
  error: string | null;

  fetchSheetMusic: () => Promise<void>;
  fetchSheetMusicById: (id: string) => Promise<void>;
  addSheetMusic: (sheetMusic: { name: string, pages: { imageUrl: string }[] }) => Promise<string>;
  updateSheetMusic: (id: string, updates: Partial<SheetMusic>) => Promise<void>;
  deleteSheetMusic: (id: string) => Promise<void>;
  // ... (altre azioni invariate) ...
}

export const useSheetMusicStore = create<SheetMusicState>()((set, get) => ({
  sheetMusics: [],
  currentSheetMusic: null,
  isLoading: false,
  error: null,

  fetchSheetMusic: async () => {
    set({ isLoading: true, error: null });
    try {
      const sheetMusics = await getAllSheetMusic();
      set({ sheetMusics, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch sheet music', isLoading: false });
    }
  },

  fetchSheetMusicById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const sheetMusic = await getSheetMusicById(id);
      set({ currentSheetMusic: sheetMusic, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch sheet music', isLoading: false });
    }
  },

  addSheetMusic: async (sheetMusic) => {
    set({ isLoading: true });
    const newSheetMusic = await createSheetMusic(sheetMusic);
    await get().fetchSheetMusic(); // Ricarica la lista
    set({ isLoading: false });
    return newSheetMusic.id;
  },

  updateSheetMusic: async (id, updates) => {
    set({ isLoading: true });
    await apiUpdateSheetMusic(id, updates);
    await get().fetchSheetMusic(); // Ricarica la lista
    if (get().currentSheetMusic?.id === id) {
      await get().fetchSheetMusicById(id); // Ricarica quello corrente
    }
    set({ isLoading: false });
  },

  deleteSheetMusic: async (id) => {
    set({ isLoading: true });
    await apiDeleteSheetMusic(id);
    await get().fetchSheetMusic(); // Ricarica la lista
    if (get().currentSheetMusic?.id === id) {
      set({ currentSheetMusic: null });
    }
    set({ isLoading: false });
  },

  // ... (implementazione delle altre azioni invariata) ...
}));
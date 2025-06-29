import { SheetMusic } from './store/useSheetMusicStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

// Funzioni per interagire con l'API degli spartiti

export const getAllSheetMusic = async (): Promise<SheetMusic[]> => {
  const response = await fetch(`${API_URL}/api/sheetmusic`);
  if (!response.ok) {
    throw new Error('Failed to fetch sheet music');
  }
  return response.json();
};

export const getSheetMusicById = async (id: string): Promise<SheetMusic> => {
  const response = await fetch(`${API_URL}/api/sheetmusic/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch sheet music');
  }
  return response.json();
};

export const createSheetMusic = async (sheetMusic: Partial<SheetMusic>): Promise<SheetMusic> => {
  const response = await fetch(`${API_URL}/api/sheetmusic`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(sheetMusic),
  });
  if (!response.ok) {
    throw new Error('Failed to create sheet music');
  }
  return response.json();
};

export const updateSheetMusic = async (id: string, sheetMusic: Partial<SheetMusic>): Promise<SheetMusic> => {
  const response = await fetch(`${API_URL}/api/sheetmusic/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(sheetMusic),
  });
  if (!response.ok) {
    throw new Error('Failed to update sheet music');
  }
  return response.json();
};

export const deleteSheetMusic = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/api/sheetmusic/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete sheet music');
  }
};

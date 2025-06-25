import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSheetMusicStore, SheetMusic } from "@/lib/store/useSheetMusicStore";
import { useToast } from "@/hooks/use-toast";

export function useHistoryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { sheetMusics, deleteSheetMusic } = useSheetMusicStore();
  const [selectedItem, setSelectedItem] = useState<SheetMusic | null>(null);

  const handleDeleteSheetMusic = (id: string) => {
    deleteSheetMusic(id);
    setSelectedItem(null);

    toast({
      title: "Sheet Music Deleted",
      description: "The sheet music has been removed from your history.",
    });
  };

  const handleEdit = (id: string) => {
    router.push(`/editor?id=${id}`);
  };

  const handleAnalyze = (id: string) => {
    router.push(`/analysis?id=${id}`);
  };

  const handleScan = () => {
    router.push('/scan');
  };

  const handleDeleteDialogOpen = (item: SheetMusic) => {
    setSelectedItem(item);
  };

  const handleDeleteDialogClose = () => {
    setSelectedItem(null);
  };

  return {
    sheetMusics,
    selectedItem,
    handleDeleteSheetMusic,
    handleEdit,
    handleAnalyze,
    handleScan,
    handleDeleteDialogOpen,
    handleDeleteDialogClose,
  };
}

"use client";

import { useEffect } from "react";
import { HistoryCard, EmptyState, DeleteDialog } from "@/components/history";
import { useHistoryPage } from "@/hooks/useHistoryPage";
import { useSheetMusicStore } from "@/lib/store/useSheetMusicStore";
import { Loader2 } from "lucide-react";

export default function HistoryPage() {
  const {
    sheetMusics,
    selectedItem,
    isLoading,
    error,
    fetchSheetMusic,
    handleDeleteSheetMusic,
    handleEdit,
    handleAnalyze,
    handleScan,
    handleDeleteDialogOpen,
    handleDeleteDialogClose,
  } = useHistoryPage();

  useEffect(() => {
    fetchSheetMusic();
  }, [fetchSheetMusic]);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-2">History</h1>
      <p className="text-muted-foreground mb-8">
        View and manage your sheet music history
      </p>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : sheetMusics.length === 0 ? (
        <EmptyState onScanClick={handleScan} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sheetMusics.map((item) => (
            <HistoryCard
              key={item.id}
              item={item}
              onEdit={handleEdit}
              onAnalyze={handleAnalyze}
              onDelete={handleDeleteDialogOpen}
            />
          ))}
        </div>
      )}

      <DeleteDialog
        item={selectedItem}
        open={!!selectedItem}
        onOpenChange={(open) => !open && handleDeleteDialogClose()}
        onConfirmDelete={handleDeleteSheetMusic}
      />
    </div>
  );
}
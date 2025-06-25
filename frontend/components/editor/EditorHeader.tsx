import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { SheetMusic } from "@/lib/store/useSheetMusicStore";

interface EditorHeaderProps {
  sheetMusic: SheetMusic;
  onSave: () => void;
  onAnalyze: () => void;
}

export function EditorHeader({ sheetMusic, onSave, onAnalyze }: EditorHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">{sheetMusic.name}</h1>
        <p className="text-muted-foreground">
          Page {sheetMusic.currentPageIndex + 1} of {sheetMusic.pages.length} •
          Last updated: {new Date(sheetMusic.updatedAt).toLocaleString()}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={onSave}>
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
        <Button size="sm" onClick={onAnalyze}>
          Analyze
        </Button>
      </div>
    </div>
  );
}

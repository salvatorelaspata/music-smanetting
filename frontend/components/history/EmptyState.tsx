import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface EmptyStateProps {
  onScanClick: () => void;
}

export function EmptyState({ onScanClick }: EmptyStateProps) {
  return (
    <div className="text-center py-16">
      <div className="flex justify-center mb-4">
        <div className="p-3 rounded-full bg-muted">
          <AlertCircle className="h-8 w-8 text-muted-foreground" />
        </div>
      </div>
      <h2 className="text-xl font-medium mb-2">No sheet music yet</h2>
      <p className="text-muted-foreground mb-6">
        Start by scanning or uploading some sheet music
      </p>
      <Button onClick={onScanClick}>
        Scan Sheet Music
      </Button>
    </div>
  );
}

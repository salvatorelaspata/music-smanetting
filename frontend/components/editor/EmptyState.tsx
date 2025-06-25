import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onScanNew: () => void;
}

export function EmptyState({ onScanNew }: EmptyStateProps) {
  return (
    <div className="container mx-auto py-16 text-center">
      <h1 className="text-3xl font-bold mb-6">No Sheet Music Selected</h1>
      <p className="mb-8">Please scan or select a sheet music to edit.</p>
      <Button onClick={onScanNew}>
        Scan New Sheet Music
      </Button>
    </div>
  );
}

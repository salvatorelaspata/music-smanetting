import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface AnnotationInputProps {
  position: { x: number; y: number };
  text: string;
  onTextChange: (text: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function AnnotationInput({
  position,
  text,
  onTextChange,
  onSave,
  onCancel,
}: AnnotationInputProps) {
  return (
    <div
      className="absolute bg-card border rounded shadow-lg p-2 z-10"
      style={{
        left: position.x,
        top: position.y
      }}
    >
      <Textarea
        placeholder="Enter annotation..."
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        className="min-h-0 text-sm mb-2"
        rows={2}
        autoFocus
      />
      <div className="flex justify-end gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={onSave}
          disabled={!text.trim()}
        >
          Save
        </Button>
      </div>
    </div>
  );
}

import { Trash2 } from "lucide-react";

interface AnnotationOverlayProps {
  annotation: {
    id: string;
    text: string;
    position: { x: number; y: number };
  };
  onDelete: () => void;
}

export function AnnotationOverlay({ annotation, onDelete }: AnnotationOverlayProps) {
  return (
    <div
      className="absolute bg-yellow-200/80 dark:bg-yellow-900/80 p-1 rounded shadow-md"
      style={{
        left: annotation.position.x,
        top: annotation.position.y,
        maxWidth: "200px"
      }}
    >
      <div className="flex text-xs justify-between mb-1">
        <span className="font-bold">Note</span>
        <button
          onClick={onDelete}
          className="text-red-600 hover:text-red-800"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
      <p className="text-xs">{annotation.text}</p>
    </div>
  );
}

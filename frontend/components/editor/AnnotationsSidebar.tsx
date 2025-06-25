import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronLeft,
  ChevronRight,
  Trash2,
  FileTextIcon,
} from "lucide-react";
import { SheetMusicPage } from "@/lib/store/useSheetMusicStore";

interface AnnotationsSidebarProps {
  currentPage: SheetMusicPage | undefined;
  isOpen: boolean;
  onToggle: () => void;
  onUpdateAnnotation: (annotationId: string, text: string) => void;
  onDeleteAnnotation: (annotationId: string) => void;
}

export function AnnotationsSidebar({
  currentPage,
  isOpen,
  onToggle,
  onUpdateAnnotation,
  onDeleteAnnotation,
}: AnnotationsSidebarProps) {
  return (
    <Card className={`${isOpen ? 'col-span-3' : 'col-span-1'} transition-all duration-200 overflow-hidden`}>
      <CardHeader className="p-3 flex flex-row items-center justify-between">
        <CardTitle className={`text-sm ${!isOpen && 'sr-only'}`}>Annotations</CardTitle>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onToggle}>
          {isOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </CardHeader>

      <CardContent className={`p-3 ${!isOpen && 'hidden'}`}>
        <ScrollArea className="h-[calc(100vh-240px)]">
          {currentPage?.annotations && currentPage.annotations.length > 0 ? (
            <div className="space-y-4">
              {currentPage.annotations.map((annotation) => (
                <div
                  key={annotation.id}
                  className="p-3 border rounded-md"
                >
                  <div className="flex justify-between mb-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      Position: ({Math.round(annotation.position.x)}, {Math.round(annotation.position.y)})
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={() => onDeleteAnnotation(annotation.id)}
                    >
                      <Trash2 className="h-3 w-3 text-red-500" />
                    </Button>
                  </div>
                  <Textarea
                    value={annotation.text}
                    onChange={(e) => onUpdateAnnotation(annotation.id, e.target.value)}
                    className="min-h-0"
                    rows={2}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileTextIcon className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No annotations on this page</p>
              <p className="text-xs text-muted-foreground mt-1">
                Use the Annotate tool to add notes to this page
              </p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

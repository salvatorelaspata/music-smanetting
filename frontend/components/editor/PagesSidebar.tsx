import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
} from "lucide-react";
import { SheetMusic } from "@/lib/store/useSheetMusicStore";
import Image from "next/image";

interface PagesSidebarProps {
  sheetMusic: SheetMusic;
  isOpen: boolean;
  onToggle: () => void;
  onPageSelect: (index: number) => void;
  onAddPage: () => void;
  onDeletePage: () => void;
  onMovePageUp: () => void;
  onMovePageDown: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function PagesSidebar({
  sheetMusic,
  isOpen,
  onToggle,
  onPageSelect,
  onAddPage,
  onDeletePage,
  onMovePageUp,
  onMovePageDown,
  fileInputRef,
  onFileUpload,
}: PagesSidebarProps) {
  return (
    <Card className={`${isOpen ? 'col-span-2' : 'col-span-1'} transition-all duration-200 overflow-hidden`}>
      <CardHeader className="p-3 flex flex-row items-center justify-between">
        <CardTitle className={`text-sm ${!isOpen && 'sr-only'}`}>Pages</CardTitle>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onToggle}>
          {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </CardHeader>

      <CardContent className={`p-2 ${!isOpen && 'hidden'}`}>
        <ScrollArea className="h-[calc(100vh-240px)]">
          <div className="space-y-2">
            {sheetMusic.pages.map((page, index) => (
              <div
                key={page.id}
                className={`relative rounded-md overflow-hidden border-2 cursor-pointer transition-all ${sheetMusic.currentPageIndex === index
                  ? 'border-primary'
                  : 'border-transparent hover:border-muted-foreground/20'
                  }`}
                onClick={() => onPageSelect(index)}
              >
                {/* <img
                  src={page.imageUrl}
                  alt={`Page ${index + 1}`}
                  className="w-full h-auto object-contain"
                /> */}
                <Image
                  src={page.imageUrl}
                  alt={`Page ${index + 1}`}
                  className="w-full h-auto object-contain"
                  width={500} // Adjust as needed
                  height={700} // Adjust as needed
                />
                <div className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm px-2 py-0.5 text-xs text-center">
                  Page {index + 1}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className={`p-3 ${!isOpen && 'hidden'}`}>
        <div className="w-full grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={onAddPage}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={onDeletePage}
            disabled={sheetMusic.pages.length <= 1}
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Delete
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={onMovePageUp}
            disabled={sheetMusic.currentPageIndex === 0}
          >
            <MoveUp className="h-3 w-3 mr-1" />
            Up
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={onMovePageDown}
            disabled={sheetMusic.currentPageIndex === sheetMusic.pages.length - 1}
          >
            <MoveDown className="h-3 w-3 mr-1" />
            Down
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          onChange={onFileUpload}
        />
      </CardFooter>
    </Card>
  );
}

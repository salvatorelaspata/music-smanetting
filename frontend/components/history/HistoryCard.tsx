import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Pencil,
  BarChart4,
  Trash2,
  CalendarIcon,
  Clock,
  FileCheck,
  FileEdit,
  FilePenLine,
  FileStack
} from "lucide-react";
import { SheetMusic } from "@/lib/store/useSheetMusicStore";
import Image from "next/image";

interface HistoryCardProps {
  item: SheetMusic;
  onEdit: (id: string) => void;
  onAnalyze: (id: string) => void;
  onDelete: (item: SheetMusic) => void;
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatTime = (date: Date) => {
  return new Date(date).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'scanned':
      return <FileCheck className="h-4 w-4" />;
    case 'edited':
      return <FileEdit className="h-4 w-4" />;
    case 'analyzed':
      return <BarChart4 className="h-4 w-4" />;
    default:
      return <FilePenLine className="h-4 w-4" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'scanned':
      return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20';
    case 'edited':
      return 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20';
    case 'analyzed':
      return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
    default:
      return 'bg-muted text-muted-foreground hover:bg-muted/80';
  }
};

export function HistoryCard({ item, onEdit, onAnalyze, onDelete }: HistoryCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-40 bg-muted">
        {item.pages && item.pages.length > 0 ? (
          <>
            {/* <img
              src={item.pages[0].imageUrl}
              alt={item.name}
              className="w-full h-full object-contain"
            /> */}
            <Image
              src={item.pages[0].imageUrl}
              alt={item.name}
              className="w-full h-full object-contain"
            />
            {item.pages.length > 1 && (
              <div className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs flex items-center">
                <FileStack className="h-3 w-3 mr-1" />
                {item.pages.length} pages
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>No pages</p>
          </div>
        )}
        <div className="absolute bottom-2 right-2">
          <Badge
            variant="outline"
            className={`${getStatusColor(item.status)} capitalize`}
          >
            {getStatusIcon(item.status)}
            <span className="ml-1">{item.status}</span>
          </Badge>
        </div>
      </div>

      <CardContent className="pt-4">
        <h3 className="font-semibold text-lg mb-1 truncate">{item.name}</h3>
        <div className="flex items-center text-sm text-muted-foreground mb-3">
          <CalendarIcon className="h-3.5 w-3.5 mr-1" />
          <span className="mr-3">{formatDate(item.updatedAt)}</span>
          <Clock className="h-3.5 w-3.5 mr-1" />
          <span>{formatTime(item.updatedAt)}</span>
        </div>

        {item.analysis && (
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Key:</span>
              <span>{item.analysis.key || 'Unknown'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Time Signature:</span>
              <span>{item.analysis.timeSignature || 'Unknown'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Measures:</span>
              <span>{item.analysis.measures || 'Unknown'}</span>
            </div>
          </div>
        )}
      </CardContent>

      <Separator />

      <CardFooter className="py-3 flex justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(item)}
        >
          <Trash2 className="h-4 w-4 text-red-500 mr-1" />
          <span className="text-sm">Delete</span>
        </Button>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(item.id)}
          >
            <Pencil className="h-4 w-4 mr-1" />
            <span className="text-sm">Edit</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAnalyze(item.id)}
          >
            <BarChart4 className="h-4 w-4 mr-1" />
            <span className="text-sm">Analyze</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

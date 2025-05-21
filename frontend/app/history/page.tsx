"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import {
  Pencil,
  BarChart4,
  Trash2,
  CalendarIcon,
  Clock,
  FileCheck,
  FileEdit,
  FilePenLine,
  AlertCircle,
  FileStack
} from "lucide-react";
import { useSheetMusicStore, SheetMusic } from "@/lib/store/useSheetMusicStore";
import { useToast } from "@/hooks/use-toast";

export default function HistoryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { sheetMusics, deleteSheetMusic } = useSheetMusicStore();
  const [selectedItem, setSelectedItem] = useState<SheetMusic | null>(null);

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

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-2">History</h1>
      <p className="text-muted-foreground mb-8">
        View and manage your sheet music history
      </p>

      {sheetMusics.length === 0 ? (
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
          <Button onClick={() => router.push('/scan')}>
            Scan Sheet Music
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sheetMusics.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="relative h-40 bg-muted">
                {item.pages && item.pages.length > 0 ? (
                  <>
                    <img
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
                  onClick={() => setSelectedItem(item)}
                >
                  <Trash2 className="h-4 w-4 text-red-500 mr-1" />
                  <span className="text-sm">Delete</span>
                </Button>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(item.id)}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    <span className="text-sm">Edit</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAnalyze(item.id)}
                  >
                    <BarChart4 className="h-4 w-4 mr-1" />
                    <span className="text-sm">Analyze</span>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {selectedItem && (
        <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Sheet Music</DialogTitle>
            </DialogHeader>
            <p>
              Are you sure you want to delete "{selectedItem.name}"?
              {selectedItem.pages && selectedItem.pages.length > 1 &&
                ` This will delete all ${selectedItem.pages.length} pages.`
              } This action cannot be undone.
            </p>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                variant="destructive"
                onClick={() => handleDeleteSheetMusic(selectedItem.id)}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
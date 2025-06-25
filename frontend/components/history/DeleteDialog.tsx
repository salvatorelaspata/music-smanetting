import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { SheetMusic } from "@/lib/store/useSheetMusicStore";

interface DeleteDialogProps {
  item: SheetMusic | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: (id: string) => void;
}

export function DeleteDialog({ item, open, onOpenChange, onConfirmDelete }: DeleteDialogProps) {
  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Sheet Music</DialogTitle>
        </DialogHeader>
        <p>
          Are you sure you want to delete "{item.name}"?
          {item.pages && item.pages.length > 1 &&
            ` This will delete all ${item.pages.length} pages.`
          } This action cannot be undone.
        </p>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={() => onConfirmDelete(item.id)}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

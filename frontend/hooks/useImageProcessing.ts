import { useRouter } from "next/navigation";
import { useSheetMusicStore } from "@/lib/store/useSheetMusicStore";
import { useToast } from "@/hooks/use-toast";

export function useImageProcessing() {
  const router = useRouter();
  const { toast } = useToast();
  const { addSheetMusic, setIsProcessing } = useSheetMusicStore();

  const processImages = async (
    imageUrls: string[],
    isOpenCVReady: boolean,
    setProcessingStatus: (status: "idle" | "processing" | "success" | "error") => void
  ) => {
    if (imageUrls.length === 0 || !isOpenCVReady) {
      toast({
        title: "Error",
        description: "Please add at least one image before processing.",
        variant: "destructive",
      });
      return;
    }

    setProcessingStatus("processing");
    setIsProcessing(true);

    try {
      // Create an array of page objects with processed image URLs
      const pages = imageUrls.map(imageUrl => ({
        imageUrl
      }));

      // Add to store with all pages
      const id = addSheetMusic({
        name: "Sheet Music " + new Date().toLocaleString(),
        pages
      });

      setProcessingStatus("success");

      // Navigate to editor with the new ID
      setTimeout(() => {
        router.push(`/editor?id=${id}`);
      }, 1500);
    } catch (error) {
      console.error("Error processing images:", error);
      setProcessingStatus("error");
      toast({
        title: "Processing Error",
        description: "Failed to process the images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return { processImages };
}

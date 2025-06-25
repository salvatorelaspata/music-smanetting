import { useState, useEffect } from "react";
import { initOpenCV } from "@/lib/opencv/opencvSetup";
import { useToast } from "@/hooks/use-toast";

export function useOpenCV() {
  const [isOpenCVReady, setIsOpenCVReady] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    initOpenCV()
      .then(() => {
        setIsOpenCVReady(true);
        console.log("OpenCV is ready");
      })
      .catch((error) => {
        console.error("Failed to initialize OpenCV", error);
        toast({
          title: "Error",
          description: "Failed to initialize OpenCV. Please refresh the page and try again.",
          variant: "destructive",
        });
      });
  }, [toast]);

  return { isOpenCVReady };
}

import { CardFooter } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface OpenCVStatusProps {
  isReady: boolean;
}

export function OpenCVStatus({ isReady }: OpenCVStatusProps) {
  if (isReady) {
    return (
      <CardFooter className="flex justify-center text-sm text-muted-foreground">
        <div className="flex items-center">
          <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
          OpenCV Ready
        </div>
      </CardFooter>
    );
  }

  return (
    <CardFooter className="flex justify-center text-sm text-muted-foreground">
      <div className="flex items-center">
        <Loader2 className="h-3 w-3 animate-spin mr-2" />
        Initializing OpenCV...
      </div>
    </CardFooter>
  );
}

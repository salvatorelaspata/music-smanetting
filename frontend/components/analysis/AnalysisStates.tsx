"use client";

import { Loader2, BarChart4 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AnalysisStatesProps {
  isAnalyzing: boolean;
  analysisComplete: boolean;
  onAnalyze: () => void;
}

export function AnalysisStates({
  isAnalyzing,
  analysisComplete,
  onAnalyze
}: AnalysisStatesProps) {
  if (analysisComplete) {
    return null;
  }

  if (isAnalyzing) {
    return (
      <Card className="mb-6">
        <CardContent className="py-8">
          <div className="text-center max-w-md mx-auto">
            <Loader2 className="h-16 w-16 mx-auto mb-4 animate-spin text-primary" />
            <h2 className="text-xl font-bold mb-2">Analyzing Your Sheet Music</h2>
            <p className="text-muted-foreground">
              This may take a moment. We{`'`}re detecting notes, analyzing the key signature,
              identifying the time signature, and processing other musical elements.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardContent className="py-8">
        <div className="text-center max-w-md mx-auto">
          <BarChart4 className="h-16 w-16 mx-auto mb-4 text-primary/60" />
          <h2 className="text-xl font-bold mb-2">Ready for Analysis</h2>
          <p className="text-muted-foreground mb-6">
            Click the {`"`}Analyze Sheet Music{`"`} button above to start the analysis process.
            This will detect notes, key signatures, time signatures, and more.
          </p>
          <Button onClick={onAnalyze}>
            Analyze Sheet Music
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

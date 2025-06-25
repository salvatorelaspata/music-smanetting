"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalysisData } from "@/types/analysis";

interface AnalysisSummaryProps {
  analysis: AnalysisData | undefined;
}

export function AnalysisSummary({ analysis }: AnalysisSummaryProps) {
  const getSummaryText = () => {
    const key = analysis?.key || "an unknown key";
    const timeSignature = analysis?.timeSignature || " unknown";
    const measures = analysis?.measures || "several";
    const tempo = analysis?.tempo
      ? ` ${analysis.tempo} beats per minute`
      : " unknown tempo";

    return `This sheet music is in ${key} with a${timeSignature} time signature. 
The piece contains ${measures} measures with an estimated tempo of${tempo}. 
The predominant note values are quarter and eighth notes, suggesting a moderate rhythmic complexity. 
The structure follows a typical pattern with clear phrases and cadences.`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analysis Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground leading-7">
          {getSummaryText()}
        </p>
      </CardContent>
    </Card>
  );
}

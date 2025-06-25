"use client";

import { ArrowLeft, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AnalysisHeaderProps {
  sheetMusicName: string;
  pagesCount: number;
  updatedAt: Date;
  analysisComplete: boolean;
  onBackToEditor: () => void;
}

export function AnalysisHeader({
  sheetMusicName,
  pagesCount,
  updatedAt,
  analysisComplete,
  onBackToEditor
}: AnalysisHeaderProps) {
  return (
    <>
      <Button variant="ghost" className="mb-6" onClick={onBackToEditor}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Editor
      </Button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{sheetMusicName} - Analysis</h1>
          <p className="text-muted-foreground">
            {pagesCount} {pagesCount === 1 ? 'page' : 'pages'} •
            {analysisComplete
              ? ` Analyzed on ${updatedAt.toLocaleString()}`
              : " Ready for analysis"
            }
          </p>
        </div>

        {analysisComplete && (
          <div className="flex items-center gap-2">
            <Button variant="outline" disabled>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" disabled>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        )}
      </div>
    </>
  );
}

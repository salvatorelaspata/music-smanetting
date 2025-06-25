"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { useSheetMusicStore } from "@/lib/store/useSheetMusicStore";
import { Button } from "@/components/ui/button";
import { useAnalysis } from "@/hooks/useAnalysis";
import {
  AnalysisHeader,
  AnalysisStates,
  AnalysisMetrics,
  AnalysisTabs,
  AnalysisSummary
} from "@/components/analysis";
import { NoteDistribution } from "@/types/analysis";
export default function AnalysisPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const { isAnalyzing, performAnalysis } = useAnalysis();

  const {
    currentSheetMusic,
    setCurrentSheetMusic
  } = useSheetMusicStore();

  // Load sheet music data from id
  useEffect(() => {
    if (id) {
      setCurrentSheetMusic(id);
    }
  }, [id, setCurrentSheetMusic]);

  // Return to editor
  const goBackToEditor = () => {
    if (!currentSheetMusic) return;
    router.push(`/editor?id=${currentSheetMusic.id}`);
  };

  // Handle analyze button click
  const handleAnalyze = () => {
    performAnalysis();
  };

  if (!currentSheetMusic) {
    return (
      <div className="container mx-auto py-16 text-center">
        <h1 className="text-3xl font-bold mb-6">No Sheet Music Selected</h1>
        <p className="mb-8">Please scan or select a sheet music to analyze.</p>
        <Button onClick={() => router.push("/scan")}>
          Scan New Sheet Music
        </Button>
      </div>
    );
  }

  const analysisComplete = !!currentSheetMusic.analysis;
  const noteDistributionData: NoteDistribution[] = currentSheetMusic.analysis?.notes || [
    { type: "quarter", count: 0 },
    { type: "eighth", count: 0 },
    { type: "half", count: 0 },
    { type: "whole", count: 0 },
    { type: "sixteenth", count: 0 }
  ];

  return (
    <div className="container mx-auto py-6">
      <AnalysisHeader
        sheetMusicName={currentSheetMusic.name}
        pagesCount={currentSheetMusic.pages.length}
        updatedAt={new Date(currentSheetMusic.updatedAt)}
        analysisComplete={analysisComplete}
        onBackToEditor={goBackToEditor}
      />

      {!analysisComplete && (
        <div className="mb-6">
          <Button onClick={handleAnalyze} disabled={isAnalyzing}>
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Analyze Sheet Music"
            )}
          </Button>
        </div>
      )}

      <AnalysisStates
        isAnalyzing={isAnalyzing}
        analysisComplete={analysisComplete}
        onAnalyze={handleAnalyze}
      />

      {analysisComplete && (
        <div className="space-y-6">
          <AnalysisMetrics analysis={currentSheetMusic.analysis} />
          <AnalysisTabs noteDistributionData={noteDistributionData} />
          <AnalysisSummary analysis={currentSheetMusic.analysis} />
        </div>
      )}
    </div>
  );
}
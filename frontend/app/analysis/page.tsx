"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { PieChart, Bar } from "recharts";
import {
  ArrowLeft,
  Download,
  Share2,
  Loader2,
  Music,
  Clock,
  BarChart4,
  FileText
} from "lucide-react";
import { useSheetMusicStore } from "@/lib/store/useSheetMusicStore";
import { Button } from "@/components/ui/button";
import { detectMusicNotation } from "@/lib/opencv/opencvSetup";

// Data for analysis charts
interface NoteDistribution {
  type: string;
  count: number;
}
export default function AnalysisPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  const {
    sheetMusics,
    currentSheetMusic,
    setCurrentSheetMusic,
    updateSheetMusic
  } = useSheetMusicStore();

  // Load sheet music data from id
  useEffect(() => {
    if (id) {
      setCurrentSheetMusic(id);
    }
  }, [id, setCurrentSheetMusic]);

  // Check if analysis has been done
  useEffect(() => {
    if (currentSheetMusic?.analysis) {
      setAnalysisComplete(true);
    }
  }, [currentSheetMusic]);

  // Perform analysis
  const performAnalysis = async () => {
    if (!currentSheetMusic) return;

    setIsAnalyzing(true);

    try {
      // Create a temporary canvas to get image data
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Create an image to load the current sheet music
      const img = new Image();
      img.src = currentSheetMusic.imageUrl;

      // Wait for the image to load
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      // Set canvas size and draw image
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);

      // Get image data for analysis
      const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);

      // Simulate delay for processing
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock analysis data
      const analysisData = {
        key: "G Major",
        timeSignature: "4/4",
        tempo: 120,
        measures: 16,
        notes: [
          { type: "quarter", count: 32 },
          { type: "eighth", count: 48 },
          { type: "half", count: 16 },
          { type: "whole", count: 4 },
          { type: "sixteenth", count: 24 }
        ]
      };

      // Update the sheet music with analysis data
      updateSheetMusic(currentSheetMusic.id, {
        analysis: analysisData,
        status: "analyzed"
      });

      setAnalysisComplete(true);
    } catch (error) {
      console.error("Analysis error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Return to editor
  const goBackToEditor = () => {
    if (!currentSheetMusic) return;
    router.push(`/editor?id=${currentSheetMusic.id}`);
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

  const noteDistributionData: NoteDistribution[] = currentSheetMusic.analysis?.notes || [
    { type: "quarter", count: 0 },
    { type: "eighth", count: 0 },
    { type: "half", count: 0 },
    { type: "whole", count: 0 },
    { type: "sixteenth", count: 0 }
  ];

  return (
    <div className="container mx-auto py-6">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={goBackToEditor}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Editor
      </Button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{currentSheetMusic.name} - Analysis</h1>
          <p className="text-muted-foreground">
            {analysisComplete ?
              `Analyzed on ${new Date(currentSheetMusic.updatedAt).toLocaleString()}` :
              "Ready for analysis"
            }
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!analysisComplete && (
            <Button onClick={performAnalysis} disabled={isAnalyzing}>
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze Sheet Music"
              )}
            </Button>
          )}

          {analysisComplete && (
            <>
              <Button variant="outline" disabled>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" disabled>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </>
          )}
        </div>
      </div>

      {!analysisComplete && !isAnalyzing && (
        <Card className="mb-6">
          <CardContent className="py-8">
            <div className="text-center max-w-md mx-auto">
              <BarChart4 className="h-16 w-16 mx-auto mb-4 text-primary/60" />
              <h2 className="text-xl font-bold mb-2">Ready for Analysis</h2>
              <p className="text-muted-foreground mb-6">
                Click the "Analyze Sheet Music" button above to start the analysis process.
                This will detect notes, key signatures, time signatures, and more.
              </p>
              <Button onClick={performAnalysis}>
                Analyze Sheet Music
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isAnalyzing && (
        <Card className="mb-6">
          <CardContent className="py-8">
            <div className="text-center max-w-md mx-auto">
              <Loader2 className="h-16 w-16 mx-auto mb-4 animate-spin text-primary" />
              <h2 className="text-xl font-bold mb-2">Analyzing Your Sheet Music</h2>
              <p className="text-muted-foreground">
                This may take a moment. We're detecting notes, analyzing the key signature,
                identifying the time signature, and processing other musical elements.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {analysisComplete && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="py-6">
                <div className="flex items-center space-x-4">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Music className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Key Signature</p>
                    <h3 className="text-2xl font-bold">{currentSheetMusic.analysis?.key || "Unknown"}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-6">
                <div className="flex items-center space-x-4">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Clock className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Time Signature</p>
                    <h3 className="text-2xl font-bold">{currentSheetMusic.analysis?.timeSignature || "Unknown"}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-6">
                <div className="flex items-center space-x-4">
                  <div className="p-2 rounded-full bg-primary/10">
                    <BarChart4 className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tempo</p>
                    <h3 className="text-2xl font-bold">{currentSheetMusic.analysis?.tempo || "Unknown"} BPM</h3>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-6">
                <div className="flex items-center space-x-4">
                  <div className="p-2 rounded-full bg-primary/10">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Measures</p>
                    <h3 className="text-2xl font-bold">{currentSheetMusic.analysis?.measures || "Unknown"}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="notes">
            <TabsList className="grid w-full grid-cols-2 max-w-md mb-6">
              <TabsTrigger value="notes">Note Distribution</TabsTrigger>
              <TabsTrigger value="structure">Structure</TabsTrigger>
            </TabsList>

            <TabsContent value="notes">
              <Card>
                <CardHeader>
                  <CardTitle>Note Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveBarChart data={noteDistributionData} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="structure">
              <Card>
                <CardHeader>
                  <CardTitle>Musical Structure</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      Detailed structure analysis coming in a future update.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card>
            <CardHeader>
              <CardTitle>Analysis Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-7">
                This sheet music is in {currentSheetMusic.analysis?.key || "an unknown key"} with a
                {currentSheetMusic.analysis?.timeSignature || " unknown"} time signature.
                The piece contains {currentSheetMusic.analysis?.measures || "several"} measures with an estimated tempo of
                {currentSheetMusic.analysis?.tempo ? ` ${currentSheetMusic.analysis.tempo} beats per minute` : " unknown tempo"}.
                The predominant note values are quarter and eighth notes, suggesting a moderate rhythmic complexity.
                The structure follows a typical pattern with clear phrases and cadences.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// Simplified chart component
function ResponsiveBarChart({ data }: { data: NoteDistribution[] }) {
  const ResponsiveBar = () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="grid grid-cols-5 gap-4 w-full max-w-xl">
        {data.map((item: NoteDistribution, index: number) => (
          <div key={index} className="flex flex-col items-center">
            <div className="w-full bg-muted rounded-md overflow-hidden">
              <div
                className="bg-chart-1 dark:bg-chart-1"
                style={{
                  height: `${(item.count / Math.max(...data.map(d => d.count || 1))) * 200}px`,
                  minHeight: '20px'
                }}
              ></div>
            </div>
            <p className="text-sm font-medium mt-2">{item.type}</p>
            <p className="text-xs text-muted-foreground">{item.count || 0}</p>
          </div>
        ))}
      </div>
    </div>
  );

  return <ResponsiveBar />;
}
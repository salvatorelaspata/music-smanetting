"use client";

import { Music, Clock, BarChart4, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AnalysisData } from "@/types/analysis";

interface AnalysisMetricsProps {
  analysis: AnalysisData | undefined;
}

export function AnalysisMetrics({ analysis }: AnalysisMetricsProps) {
  const metrics = [
    {
      icon: Music,
      label: "Key Signature",
      value: analysis?.key || "Unknown"
    },
    {
      icon: Clock,
      label: "Time Signature",
      value: analysis?.timeSignature || "Unknown"
    },
    {
      icon: BarChart4,
      label: "Tempo",
      value: analysis?.tempo ? `${analysis.tempo} BPM` : "Unknown"
    },
    {
      icon: FileText,
      label: "Measures",
      value: analysis?.measures?.toString() || "Unknown"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => {
        const IconComponent = metric.icon;
        return (
          <Card key={index}>
            <CardContent className="py-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 rounded-full bg-primary/10">
                  <IconComponent className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {metric.label}
                  </p>
                  <h3 className="text-2xl font-bold">{metric.value}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

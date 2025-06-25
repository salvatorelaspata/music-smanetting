"use client";

import { NoteDistribution } from "@/types/analysis";

interface NoteDistributionChartProps {
  data: NoteDistribution[];
}

export function NoteDistributionChart({ data }: NoteDistributionChartProps) {
  const maxCount = Math.max(...data.map(d => d.count || 1));

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="grid grid-cols-5 gap-4 w-full max-w-xl">
        {data.map((item: NoteDistribution, index: number) => (
          <div key={index} className="flex flex-col items-center">
            <div className="w-full bg-muted rounded-md overflow-hidden">
              <div
                className="bg-chart-1 dark:bg-chart-1"
                style={{
                  height: `${(item.count / maxCount) * 200}px`,
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
}

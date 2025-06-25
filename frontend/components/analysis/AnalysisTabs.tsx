"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NoteDistributionChart } from "./NoteDistributionChart";
import { NoteDistribution } from "@/types/analysis";

interface AnalysisTabsProps {
  noteDistributionData: NoteDistribution[];
}

export function AnalysisTabs({ noteDistributionData }: AnalysisTabsProps) {
  return (
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
              <NoteDistributionChart data={noteDistributionData} />
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
  );
}

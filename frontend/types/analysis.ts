export interface NoteDistribution {
  type: string;
  count: number;
}

export interface AnalysisData {
  key?: string;
  timeSignature?: string;
  tempo?: number;
  measures?: number;
  notes?: NoteDistribution[];
}

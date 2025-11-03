export interface ScoredAnalysisSection {
  category: string;
  score: number; // 1 to 5
  explanation: string;
}

export interface Violation {
  id: number;
  category: string;
  description: string;
  coordinates: {
    x: number;
    y: number;
  };
}

export interface AnalysisResult {
  overallAnalysis: string;
  scoredAnalysis: ScoredAnalysisSection[];
  violations: Violation[];
}

export interface ImageData {
  base64: string;
  mimeType: string;
  url: string;
  filename: string;
}

export interface HistoryEntry {
  id: number;
  originalImage: ImageData;
  analysisResult: AnalysisResult;
  timestamp: string;
}

export interface AnalysisResult {
  gap_summary: string;
  missing_skills: string[];
  certifications: string[];
  learning_resources: string[];
}

export interface ResumeFilePart {
  data: string; // Base64 encoded content
  mimeType: string;
}

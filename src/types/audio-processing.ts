export interface AudioProcessingResult {
  success: boolean;
  error?: string;
  [key: string]: string | boolean | undefined;
}
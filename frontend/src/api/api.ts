/** API client and shared response types for AgriVisionAI. */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

if (import.meta.env.DEV) {
  console.info('API Base URL:', API_BASE_URL);
}

export interface Prediction {
  disease: string;
  confidence: number;
  confidence_percentage: string;
}

export interface TreatmentInfo {
  description: string;
  treatment: string[];
  prevention: string[];
}

export interface PredictionResponse {
  success: boolean;
  primary_prediction: Prediction;
  all_predictions: Prediction[];
  treatment: TreatmentInfo;
  image_info?: {
    filename: string;
    original_filename: string;
  };
}

export interface HealthResponse {
  status: string;
  service: string;
  timestamp: string;
  version: string;
}

export async function checkHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) {
    throw new Error('Health check failed');
  }
  return response.json();
}

export async function predictFromImage(file: File): Promise<PredictionResponse> {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${API_BASE_URL}/predict`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Prediction failed');
  }

  return response.json();
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

export function formatDiseaseName(disease: string): string {
  return disease
    .replace(/___/g, ' - ')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.8) return 'bg-green-500';
  if (confidence >= 0.6) return 'bg-yellow-500';
  if (confidence >= 0.4) return 'bg-orange-500';
  return 'bg-red-500';
}

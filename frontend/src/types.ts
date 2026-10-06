import type { Prediction } from './api/api';

export interface HistoryItem {
  id: string;
  timestamp: Date;
  imageName: string;
  prediction: Prediction;
  imageData: string;
}

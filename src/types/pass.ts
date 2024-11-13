// frontend/src/types/pass.ts
export interface PassData {
    visits: number;
    name: string;
    nextReward: string;
  }
  
  export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
  }
  
  export interface ScanResult {
    text: string;
  }
  
  export interface ScanError extends Error {
    message: string;
  }
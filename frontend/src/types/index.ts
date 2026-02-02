export interface FileInfo {
  name: string;
  url: string;
}

export interface UploadResponse {
  message: string;
  diff?: any[];
}

export interface AuthResponse {
  token: string;
  userId: number;
}

export interface ApiError {
  error: string;
}

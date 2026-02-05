export interface User {
  email: string;
  name?: string;
  avatar?: string;
}

export interface Message {
  id?: number;
  message: string;
  senderEmail: string;
  receiverEmail?: string;
  groupId?: number;
  createdAt?: string;
}

export interface Group {
  id: number;
  name: string;
}

export interface FileInfo {
  name: string;
  url: string;
}

export interface AuthResponse {
  token: string;
  user?: User;
}

export interface UploadResponse {
  message: string;
}

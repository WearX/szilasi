import type { FileInfo, UploadResponse, AuthResponse } from '../types';

const API_BASE = 'http://localhost:3000';

const getAuthHeader = (): HeadersInit => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const api = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/user/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error('Bejelentkezés sikertelen');
    return res.json();
  },

  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/user/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) throw new Error('Regisztráció sikertelen');
    return res.json();
  },

  async uploadAvatar(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('avatar', file);

    const res = await fetch(`${API_BASE}/user/avatar`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: formData,
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Avatar feltöltés sikertelen');
    }
    return res.json();
  },

  async uploadFile(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/file/upload`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: formData,
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Fájl feltöltés sikertelen');
    }
    return res.json();
  },

  async uploadFiles(files: File[]): Promise<UploadResponse> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    const res = await fetch(`${API_BASE}/files/upload`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: formData,
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Fájlok feltöltése sikertelen');
    }
    return res.json();
  },

  async getFiles(): Promise<FileInfo[]> {
    const res = await fetch(`${API_BASE}/files`, {
      headers: getAuthHeader(),
    });
    if (!res.ok) {
      if (res.status === 404) return [];
      throw new Error('Fájlok lekérése sikertelen');
    }
    return res.json();
  },

  getDownloadUrl(fileId: string): string {
    return `${API_BASE}/file/${fileId}`;
  },
};

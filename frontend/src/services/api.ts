import type { AuthResponse, Message, Group, FileInfo, UploadResponse } from '../types';

const API_BASE = 'http://localhost:3000';

const getToken = () => localStorage.getItem('token');

const headers = () => ({
  'x-access-token': getToken() || '',
});

const jsonHeaders = () => ({
  'Content-Type': 'application/json',
  'x-access-token': getToken() || '',
});

export const api = {
  // Auth
  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/user/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Bejelentkezés sikertelen');
    }
    return res.json();
  },

  async register(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/user/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Regisztráció sikertelen');
    }
    return res.json();
  },

  // Messages
  async getMessages(): Promise<Message[]> {
    const res = await fetch(`${API_BASE}/messages`, { headers: headers() });
    if (!res.ok) return [];
    return res.json();
  },

  async sendMessage(payload: { message: string; targetEmail?: string; groupId?: number }): Promise<void> {
    await fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify(payload),
    });
  },

  // Groups
  async getGroups(): Promise<Group[]> {
    const res = await fetch(`${API_BASE}/groups`, { headers: headers() });
    if (!res.ok) return [];
    return res.json();
  },

  async createGroup(name: string, members: string[]): Promise<void> {
    const res = await fetch(`${API_BASE}/groups`, {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify({ name, members }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Csoport létrehozása sikertelen');
    }
  },

  // Avatar
  async uploadAvatar(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('avatar', file);
    const res = await fetch(`${API_BASE}/user/avatar`, {
      method: 'PUT',
      headers: headers(),
      body: formData,
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Avatar feltöltés sikertelen');
    }
    return res.json();
  },

  // Files
  async uploadFiles(files: File[]): Promise<UploadResponse> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    const res = await fetch(`${API_BASE}/files/upload`, {
      method: 'POST',
      headers: headers(),
      body: formData,
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Fájl feltöltés sikertelen');
    }
    return res.json();
  },

  async getFiles(): Promise<FileInfo[]> {
    const res = await fetch(`${API_BASE}/files`, { headers: headers() });
    if (!res.ok) return [];
    return res.json();
  },

  async downloadFile(url: string, filename: string): Promise<void> {
    const res = await fetch(url, { headers: headers() });
    if (!res.ok) throw new Error('Letöltés sikertelen');
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  },

  // WebSocket URL
  getWsUrl(): string {
    return `ws://localhost:8080?token=${getToken()}`;
  },
};

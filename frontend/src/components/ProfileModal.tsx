import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import type { FileInfo } from '../types';

interface Props {
  onClose: () => void;
  avatarUrl: string | null;
  onAvatarChange: (url: string) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_FILES = 10;

export const ProfileModal = ({ onClose, avatarUrl, onAvatarChange }: Props) => {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [status, setStatus] = useState<{ msg: string; error: boolean } | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    setLoading(true);
    const data = await api.getFiles();
    setFiles(data);
    setLoading(false);
  };

  const showStatus = (msg: string, error = false) => {
    setStatus({ msg, error });
    setTimeout(() => setStatus(null), 3000);
  };

  const handleAvatarUpload = async (file: File) => {
    if (!['image/png', 'image/jpg', 'image/jpeg'].includes(file.type)) {
      showStatus('Csak PNG, JPG vagy JPEG!', true);
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      showStatus('Max 5MB méret!', true);
      return;
    }

    setAvatarUploading(true);
    try {
      await api.uploadAvatar(file);
      const reader = new FileReader();
      reader.onload = (e) => onAvatarChange(e.target?.result as string);
      reader.readAsDataURL(file);
      showStatus('Profilkép feltöltve!');
      loadFiles();
    } catch (err) {
      showStatus(err instanceof Error ? err.message : 'Hiba!', true);
    }
    setAvatarUploading(false);
  };

  const handleAvatarDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleAvatarUpload(file);
  };

  const addFiles = (newFiles: File[]) => {
    const valid = newFiles.filter((f) => {
      if (f.size > MAX_FILE_SIZE) {
        showStatus(`${f.name} túl nagy!`, true);
        return false;
      }
      return true;
    });
    setSelectedFiles((prev) => [...prev, ...valid].slice(0, MAX_FILES));
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    addFiles(Array.from(e.dataTransfer.files));
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return;
    setUploading(true);
    try {
      await api.uploadFiles(selectedFiles);
      showStatus(`${selectedFiles.length} fájl feltöltve!`);
      setSelectedFiles([]);
      loadFiles();
    } catch (err) {
      showStatus(err instanceof Error ? err.message : 'Hiba!', true);
    }
    setUploading(false);
  };

  const getFileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    const icons: Record<string, string> = {
      pdf: '📄', doc: '📝', docx: '📝', xls: '📊', xlsx: '📊',
      png: '🖼️', jpg: '🖼️', jpeg: '🖼️', gif: '🖼️',
      mp4: '🎬', mp3: '🎵', zip: '📦', rar: '📦',
    };
    return icons[ext || ''] || '📎';
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal profile-modal">
        <h3>Profil beállítások</h3>

        {status && (
          <div className={status.error ? 'status-error' : 'status-success'}>
            {status.msg}
          </div>
        )}

        {/* Avatar Section */}
        <div className="profile-section">
          <h4>Profilkép</h4>
          <div className="avatar-preview">
            <div className="large-avatar">
              {avatarUploading ? (
                <div className="spinner" />
              ) : avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" />
              ) : '?'}
            </div>
          </div>
          <div
            className="drop-zone"
            onClick={() => avatarInputRef.current?.click()}
            onDrop={handleAvatarDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/png,image/jpg,image/jpeg"
              style={{ display: 'none' }}
              onChange={(e) => e.target.files?.[0] && handleAvatarUpload(e.target.files[0])}
            />
            <div className="drop-zone-content">
              <svg viewBox="0 0 24 24" width="32" height="32" style={{ fill: '#999', marginBottom: 8 }}>
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
              </svg>
              <span>Kattints vagy húzd ide a képet</span>
            </div>
          </div>
          <p className="hint">PNG, JPG vagy JPEG, max 5MB</p>
        </div>

        {/* File Upload Section */}
        <div className="profile-section">
          <h4>Fájlok feltöltése</h4>
          <div
            className="drop-zone"
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleFileDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              style={{ display: 'none' }}
              onChange={(e) => e.target.files && addFiles(Array.from(e.target.files))}
            />
            <div className="drop-zone-content">
              <svg viewBox="0 0 24 24" width="32" height="32" style={{ fill: '#999', marginBottom: 8 }}>
                <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/>
              </svg>
              <span>Kattints vagy húzd ide a fájlokat</span>
            </div>
          </div>

          {selectedFiles.length > 0 && (
            <div className="selected-files-list">
              {selectedFiles.map((file, i) => (
                <div key={i} className="selected-file-item">
                  <span className="file-icon">{getFileIcon(file.name)}</span>
                  <div className="file-info">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">{formatSize(file.size)}</span>
                  </div>
                  <button className="btn-remove" onClick={() => setSelectedFiles((p) => p.filter((_, j) => j !== i))}>
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {selectedFiles.length > 0 && (
            <button className="btn btn-primary" onClick={uploadFiles} disabled={uploading} style={{ marginTop: 12 }}>
              {uploading ? 'Feltöltés...' : 'Fájlok feltöltése'}
            </button>
          )}
          <p className="hint">Max 10 fájl, egyenként max 5MB</p>
        </div>

        {/* Files List */}
        <div className="profile-section">
          <h4>Feltöltött fájlok</h4>
          <div className="files-list">
            {loading ? (
              <div className="loading"><div className="spinner" /> Betöltés...</div>
            ) : files.length === 0 ? (
              <div className="empty-files">Nincsenek feltöltött fájlok</div>
            ) : (
              files.map((file, i) => (
                <div key={i} className="file-item">
                  <span className="file-icon">{getFileIcon(file.name)}</span>
                  <span className="file-name">{file.name}</span>
                  <button className="btn-download" onClick={() => api.downloadFile(file.url, file.name)}>
                    Letöltés
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-cancel" onClick={onClose}>Bezárás</button>
        </div>
      </div>
    </div>
  );
};

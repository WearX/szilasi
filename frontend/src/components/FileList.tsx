import { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { FileInfo } from '../types';

interface FileListProps {
  refreshTrigger: number;
}

export const FileList = ({ refreshTrigger }: FileListProps) => {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchFiles = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await api.getFiles();
      setFiles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hiba történt');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [refreshTrigger]);

  const handleDownload = async (file: FileInfo) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(file.url, {
        headers: { 'x-access-token': token || '' },
      });

      if (!response.ok) throw new Error('Letöltés sikertelen');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Letöltés sikertelen');
    }
  };

  const getFileIcon = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const icons: Record<string, string> = {
      pdf: '📄',
      doc: '📝',
      docx: '📝',
      xls: '📊',
      xlsx: '📊',
      png: '🖼️',
      jpg: '🖼️',
      jpeg: '🖼️',
      gif: '🖼️',
      mp4: '🎬',
      mp3: '🎵',
      zip: '📦',
      rar: '📦',
    };
    return icons[ext || ''] || '📎';
  };

  return (
    <div className="profile-section full-width">
      <h3>Feltöltött fájlok</h3>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <span>Betöltés...</span>
        </div>
      ) : files.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📂</div>
          <span>Nincsenek feltöltött fájlok</span>
        </div>
      ) : (
        <div className="files-list">
          {files.map((file, index) => (
            <div key={index} className="file-item">
              <span className="file-icon">{getFileIcon(file.name)}</span>
              <span className="file-name" title={file.name}>
                {file.name}
              </span>
              <button
                className="btn-download"
                onClick={() => handleDownload(file)}
              >
                Letöltés
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        className="btn btn-secondary"
        onClick={fetchFiles}
        style={{ marginTop: '12px' }}
      >
        Frissítés
      </button>
    </div>
  );
};

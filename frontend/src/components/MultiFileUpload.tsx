import { useState, useRef } from 'react';
import { api } from '../services/api';

const MAX_FILES = 10;
const MAX_SIZE = 5 * 1024 * 1024;

interface SelectedFile {
  file: File;
  id: string;
  error?: string;
}

export const MultiFileUpload = ({ onUploadComplete }: { onUploadComplete: () => void }) => {
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | undefined => {
    if (file.size > MAX_SIZE) {
      return 'Maximum 5MB engedélyezett';
    }
    return undefined;
  };

  const handleFilesSelect = (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const totalFiles = selectedFiles.length + fileArray.length;

    if (totalFiles > MAX_FILES) {
      setError(`Maximum ${MAX_FILES} fájl tölthető fel egyszerre!`);
      return;
    }

    setError('');
    setSuccess('');
    const newFiles: SelectedFile[] = fileArray.map((file) => ({
      file,
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      error: validateFile(file),
    }));

    setSelectedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleRemove = (id: string) => {
    setSelectedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleUpload = async () => {
    const validFiles = selectedFiles.filter((f) => !f.error);
    if (validFiles.length === 0) {
      setError('Nincs feltölthető fájl!');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.uploadFiles(validFiles.map((f) => f.file));
      setSuccess(`${validFiles.length} fájl sikeresen feltöltve!`);
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      onUploadComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hiba történt');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFilesSelect(e.dataTransfer.files);
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const validCount = selectedFiles.filter((f) => !f.error).length;

  return (
    <div className="profile-section">
      <h3>Fájlok feltöltése</h3>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div
        className="file-drop-zone"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="drop-text">
          <div className="icon">📁</div>
          <span>Kattints vagy húzd ide a fájlokat</span>
          <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
            {selectedFiles.length}/{MAX_FILES} fájl kiválasztva
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={(e) => handleFilesSelect(e.target.files)}
        className="hidden-input"
      />

      {selectedFiles.length > 0 && (
        <div className="selected-files">
          {selectedFiles.map(({ file, id, error: fileError }) => (
            <div key={id} className={`selected-file-item ${fileError ? 'has-error' : ''}`}>
              <div className="file-info">
                <span className="file-name">{file.name}</span>
                <span className="file-size">{formatSize(file.size)}</span>
                {fileError && <span className="file-error">{fileError}</span>}
              </div>
              <button
                className="btn-remove"
                onClick={() => handleRemove(id)}
                disabled={loading}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        className="btn btn-primary"
        onClick={handleUpload}
        disabled={validCount === 0 || loading}
        style={{ marginTop: '12px' }}
      >
        {loading ? 'Feltöltés...' : `${validCount} fájl feltöltése`}
      </button>

      <p className="hint">Maximum 10 fájl, egyenként max 5MB</p>
    </div>
  );
};

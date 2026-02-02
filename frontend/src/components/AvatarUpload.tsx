import { useState, useRef } from 'react';
import { api } from '../services/api';

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/png', 'image/jpg', 'image/jpeg'];

export const AvatarUpload = () => {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Csak PNG, JPG vagy JPEG formátum engedélyezett!';
    }
    if (file.size > MAX_SIZE) {
      return 'A fájl mérete maximum 5MB lehet!';
    }
    return null;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setPreview(null);
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.uploadAvatar(file);
      setSuccess('Avatar sikeresen feltöltve!');
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hiba történt');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    if (fileInputRef.current) {
      const dt = new DataTransfer();
      dt.items.add(file);
      fileInputRef.current.files = dt.files;
    }

    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="upload-section">
      <h3>Avatar feltöltés</h3>
      <p className="upload-info">PNG, JPG vagy JPEG formátum, max 5MB</p>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div
        className={`drop-zone avatar-drop ${preview ? 'has-preview' : ''}`}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileInputRef.current?.click()}
      >
        {preview ? (
          <img src={preview} alt="Avatar preview" className="avatar-preview" />
        ) : (
          <div className="drop-placeholder">
            <span className="drop-icon">📷</span>
            <span>Kattints vagy húzd ide a képet</span>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".png,.jpg,.jpeg"
        onChange={handleFileSelect}
        className="hidden-input"
      />

      <button
        className="btn btn-primary"
        onClick={handleUpload}
        disabled={!preview || loading}
      >
        {loading ? 'Feltöltés...' : 'Avatar feltöltése'}
      </button>
    </div>
  );
};

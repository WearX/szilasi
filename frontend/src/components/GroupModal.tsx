import { useState } from 'react';
import { api } from '../services/api';

interface Props {
  onClose: () => void;
  users: string[];
  onCreated: () => void;
}

export const GroupModal = ({ onClose, users, onCreated }: Props) => {
  const [name, setName] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleUser = (user: string) => {
    setSelected((prev) =>
      prev.includes(user) ? prev.filter((u) => u !== user) : [...prev, user]
    );
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Add meg a csoport nevét!');
      return;
    }
    if (selected.length === 0) {
      setError('Válassz legalább egy tagot!');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.createGroup(name, selected);
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hiba történt');
    }

    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h3>Új csoport létrehozása</h3>

        {error && <div className="error-message">{error}</div>}

        <input
          type="text"
          placeholder="Csoport neve"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="user-list">
          {users.length === 0 ? (
            <div style={{ padding: 20, textAlign: 'center', color: '#999', fontSize: 13 }}>
              Nincs elérhető felhasználó
            </div>
          ) : (
            users.map((user) => (
              <div key={user} className="user-list-item" onClick={() => toggleUser(user)}>
                <input
                  type="checkbox"
                  checked={selected.includes(user)}
                  onChange={() => toggleUser(user)}
                />
                <label>{user.split('@')[0]}</label>
              </div>
            ))
          )}
        </div>

        <div className="modal-actions">
          <button className="btn btn-cancel" onClick={onClose}>Mégse</button>
          <button className="btn btn-primary" onClick={handleCreate} disabled={loading}>
            {loading ? 'Létrehozás...' : 'Létrehozás'}
          </button>
        </div>
      </div>
    </div>
  );
};

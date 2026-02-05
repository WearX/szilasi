import { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (type: 'signin' | 'signup') => {
    if (!email || !password) {
      setError('Töltsd ki mindkét mezőt!');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = type === 'signin'
        ? await api.login(email, password)
        : await api.register(email, password);
      login(res.token, email);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hiba történt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Belépés</h1>

        {error && <div className="error-message">{error}</div>}

        <div className="input-group">
          <label>Email cím</label>
          <input
            type="email"
            placeholder="pelda@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="input-group">
          <label>Jelszó</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAuth('signin')}
            disabled={loading}
          />
        </div>

        <button
          className="btn btn-primary"
          onClick={() => handleAuth('signin')}
          disabled={loading}
        >
          {loading ? 'Betöltés...' : 'Belépés'}
        </button>

        <button
          className="btn btn-secondary"
          onClick={() => handleAuth('signup')}
          disabled={loading}
        >
          Új fiók létrehozása
        </button>
      </div>
    </div>
  );
};

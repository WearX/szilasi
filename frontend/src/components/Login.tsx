import { useState } from 'react';
import { api } from '../services/api';

interface LoginProps {
  onLogin: (token: string) => void;
}

export const Login = ({ onLogin }: LoginProps) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isRegister) {
        const res = await api.register(name, email, password);
        onLogin(res.token);
      } else {
        const res = await api.login(email, password);
        onLogin(res.token);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hiba történt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>{isRegister ? 'Regisztráció' : 'Bejelentkezés'}</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-group">
              <label htmlFor="name">Név</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Jelszó</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Betöltés...' : isRegister ? 'Regisztráció' : 'Bejelentkezés'}
          </button>
        </form>

        <p className="toggle-text">
          {isRegister ? 'Már van fiókod?' : 'Nincs még fiókod?'}{' '}
          <button
            type="button"
            className="link-btn"
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister ? 'Bejelentkezés' : 'Regisztráció'}
          </button>
        </p>
      </div>
    </div>
  );
};

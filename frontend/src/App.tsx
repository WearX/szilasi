import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { Login, AvatarUpload, MultiFileUpload, FileList } from './components';
import './App.css';

function App() {
  const { isAuthenticated, loading, login, logout } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadComplete = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner"></div>
        <span>Betöltés...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={login} />;
  }

  return (
    <div className="main-container">
      <header className="main-header">
        <div className="header-left">
          <div className="user-avatar">?</div>
          <div className="user-info">
            <h2>Fájlkezelő</h2>
          </div>
        </div>
        <button className="btn-logout" onClick={logout}>
          Kijelentkezés
        </button>
      </header>

      <div className="content-area">
        <div className="sections-grid">
          <AvatarUpload />
          <MultiFileUpload onUploadComplete={handleUploadComplete} />
          <FileList refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </div>
  );
}

export default App;

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
    <div className="app">
      <header className="header">
        <h1>Fájlkezelő</h1>
        <button className="btn btn-logout" onClick={logout}>
          Kijelentkezés
        </button>
      </header>

      <main className="main-content">
        <div className="upload-grid">
          <AvatarUpload />
          <MultiFileUpload onUploadComplete={handleUploadComplete} />
        </div>

        <FileList refreshTrigger={refreshTrigger} />
      </main>

      <footer className="footer">
        <p>Fájlkezelő alkalmazás</p>
      </footer>
    </div>
  );
}

export default App;

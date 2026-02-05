import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import { Chat } from './components/Chat';
import './App.css';

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner" />
        <span>Betöltés...</span>
      </div>
    );
  }

  return isAuthenticated ? <Chat /> : <Login />;
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

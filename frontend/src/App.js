import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/Sidebar';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import CollegesPage from './pages/CollegesPage';
import CollegeDetail from './pages/CollegeDetail';
import ChatPage from './pages/ChatPage';
import ComparePage from './pages/ComparePage';
import MapPage from './pages/MapPage';
import RecommendPage from './pages/RecommendPage';
import FavoritesPage from './pages/FavoritesPage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div className="spinner" />
    </div>
  );
  return user ? children : <Navigate to="/auth" replace />;
}

function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <main style={{
        marginLeft: collapsed ? 70 : 260,
        flex: 1,
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        transition: 'margin-left 0.25s ease',
        overflow: 'auto',
      }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/colleges" element={<CollegesPage />} />
          <Route path="/colleges/:id" element={<CollegeDetail />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/recommend" element={<RecommendPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/*" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            } />
          </Routes>
          <ToastContainer
            position="bottom-right"
            autoClose={3000}
            hideProgressBar={false}
            theme="dark"
            toastStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

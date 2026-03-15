import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DatasetManager from './pages/DatasetManager';
import Analytics from './pages/Analytics';
import Insights from './pages/Insights';
import Monitoring from './pages/Monitoring';
import Predictions from './pages/Predictions';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/datasets" element={<ProtectedRoute><DatasetManager /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/insights" element={<ProtectedRoute><Insights /></ProtectedRoute>} />
            <Route path="/monitoring" element={<ProtectedRoute><Monitoring /></ProtectedRoute>} />
            <Route path="/predictions" element={<ProtectedRoute><Predictions /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid #334155'
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#1e293b' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#1e293b' } }
          }}
        />
      </DataProvider>
    </AuthProvider>
  );
}

export default App;

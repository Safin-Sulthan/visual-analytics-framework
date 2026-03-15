import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import ProtectedRoute from './components/common/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import DatasetsPage from './pages/DatasetsPage'
import EdaPage from './pages/EdaPage'
import AnalyticsPage from './pages/AnalyticsPage'
import InsightsPage from './pages/InsightsPage'
import TemporalPage from './pages/TemporalPage'
import PredictionsPage from './pages/PredictionsPage'
import AnomaliesPage from './pages/AnomaliesPage'
import NlpPage from './pages/NlpPage'
import ReportsPage from './pages/ReportsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/datasets" element={<DatasetsPage />} />
          <Route path="/eda" element={<EdaPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="/temporal" element={<TemporalPage />} />
          <Route path="/predictions" element={<PredictionsPage />} />
          <Route path="/anomalies" element={<AnomaliesPage />} />
          <Route path="/nlp" element={<NlpPage />} />
          <Route path="/reports" element={<ReportsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

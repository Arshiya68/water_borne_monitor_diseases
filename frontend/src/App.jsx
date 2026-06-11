import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/common/ProtectedRoute'
import { useAuth } from './hooks/useAuth'
import { Toaster } from 'react-hot-toast'

// Pages
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import VillagerDashboard from './pages/VillagerDashboard'
import OfficialDashboard from './pages/OfficialDashboard'
import AshaDashboard from './pages/AshaDashboard'
import AdminDashboard from './pages/AdminDashboard'
import UserProfile from './pages/UserProfile'
import SettingsPage from './pages/SettingsPage'
import MapViewPage from './pages/MapViewPage'
import DataAnalysisPage from './pages/DataAnalysisPage'
import ReportSymptomsPage from './pages/ReportSymptomsPage'
import ReportsPage from './pages/ReportsPage'

export default function App() {
  return (
    <Router>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route
            path="/villager"
            element={
              <ProtectedRoute roles={['villager']}>
                <VillagerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/asha"
            element={
              <ProtectedRoute roles={['asha_worker']}>
                <AshaDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/official"
            element={
              <ProtectedRoute roles={['official']}>
                <OfficialDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />


          {/* Shared Routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/map"
            element={
              <ProtectedRoute>
                <MapViewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analysis"
            element={
              <ProtectedRoute>
                <DataAnalysisPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/report"
            element={
              <ProtectedRoute>
                <ReportSymptomsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <ReportsPage />
              </ProtectedRoute>
            }
          />

          {/* Default: render early warning homepage landing */}
          <Route
            path="/"
            element={<HomePage />}
          />
        </Routes>
    </Router>
  )
}

function RoleRedirect() {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-700">
        <div className="text-center">
          <div className="h-10 w-10 mx-auto mb-4 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
          <p className="text-lg font-semibold">Checking your session...</p>
        </div>
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />

  const roleMap = {
    villager: '/villager',
    asha_worker: '/asha',
    official: '/official',
    admin: '/admin',
  }

  return <Navigate to={roleMap[user.role] || '/report'} replace />
}
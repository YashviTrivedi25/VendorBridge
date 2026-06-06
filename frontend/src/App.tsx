import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a2e18',
              color: '#d1fae5',
              border: '1px solid rgba(34,197,94,0.2)',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#052e16' } },
            error: {
              style: {
                background: '#1f1215',
                color: '#fca5a5',
                border: '1px solid rgba(239,68,68,0.2)',
              },
            },
          }}
        />

        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes (All pointing to the dashboard shell for now) */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/vendors" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/rfqs" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/quotations" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/purchase-orders" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/invoices" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/approvals" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/logs" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />

          {/* Unauthorized */}

          <Route
            path="/unauthorized"
            element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="glass-card p-10 text-center max-w-md">
                  <p className="text-4xl mb-4">🚫</p>
                  <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
                  <p className="text-gray-400 text-sm">You don't have permission to view this page.</p>
                </div>
              </div>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}


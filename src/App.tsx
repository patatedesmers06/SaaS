import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@stores/authStore'

// Layouts
import AuthLayout from '@components/layout/AuthLayout'
import DashboardLayout from '@components/layout/DashboardLayout'

// Auth Pages
import Login from '@pages/auth/Login'
import Register from '@pages/auth/Register'
import ForgotPassword from '@pages/auth/ForgotPassword'

// Employee Pages
import EmployeeDashboard from '@pages/employee/Dashboard'
import NewRequest from '@pages/employee/NewRequest'
import MyRequests from '@pages/employee/MyRequests'

// Manager Pages
import TeamDashboard from '@pages/manager/TeamDashboard'
import Approvals from '@pages/manager/Approvals'

// Admin Pages
import AdminDashboard from '@pages/admin/Dashboard'
import UsersManagement from '@pages/admin/UsersManagement'
import TeamsManagement from '@pages/admin/TeamsManagement'
import LeaveTypesSettings from '@pages/admin/LeaveTypesSettings'
import CompanySettings from '@pages/admin/CompanySettings'
import Reports from '@pages/admin/Reports'

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
  const { user, isLoading, isInitialized } = useAuthStore()

  // Only show loading if we're still initializing for the first time
  if (!isInitialized || isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Chargement...</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

function App() {
  const { initialize, isInitialized } = useAuthStore()

  // Initialize auth on app mount
  useEffect(() => {
    if (!isInitialized) {
      initialize()
    }
  }, [initialize, isInitialized])

  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      {/* Protected Dashboard Routes */}
      <Route element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Employee Routes (all roles) */}
        <Route path="/dashboard" element={<EmployeeDashboard />} />
        <Route path="/new-request" element={<NewRequest />} />
        <Route path="/my-requests" element={<MyRequests />} />

        {/* Manager Routes */}
        <Route path="/team" element={
          <ProtectedRoute allowedRoles={['manager', 'hr', 'admin']}>
            <TeamDashboard />
          </ProtectedRoute>
        } />
        <Route path="/approvals" element={
          <ProtectedRoute allowedRoles={['manager', 'hr', 'admin']}>
            <Approvals />
          </ProtectedRoute>
        } />

        {/* Admin/HR Routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['hr', 'admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute allowedRoles={['hr', 'admin']}>
            <UsersManagement />
          </ProtectedRoute>
        } />
        <Route path="/admin/teams" element={
          <ProtectedRoute allowedRoles={['hr', 'admin']}>
            <TeamsManagement />
          </ProtectedRoute>
        } />
        <Route path="/admin/leave-types" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <LeaveTypesSettings />
          </ProtectedRoute>
        } />
        <Route path="/admin/settings" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <CompanySettings />
          </ProtectedRoute>
        } />
        <Route path="/admin/reports" element={
          <ProtectedRoute allowedRoles={['hr', 'admin']}>
            <Reports />
          </ProtectedRoute>
        } />
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App

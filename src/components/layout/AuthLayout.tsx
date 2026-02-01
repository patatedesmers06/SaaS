import { Outlet, Navigate } from 'react-router-dom'
import { useAuthStore } from '@stores/authStore'
import './AuthLayout.css'

export default function AuthLayout() {
  const { user, isLoading } = useAuthStore()
  
  // Redirect if already logged in
  if (!isLoading && user) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="auth-layout">
      <div className="auth-layout__background">
        <div className="auth-layout__gradient"></div>
        <div className="auth-layout__pattern"></div>
      </div>
      
      <div className="auth-layout__container">
        <div className="auth-layout__content">
          <div className="auth-layout__header">
            <div className="auth-layout__logo">
              <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="40" rx="10" fill="url(#logo-gradient)" />
                <path d="M12 20C12 15.5817 15.5817 12 20 12V12C24.4183 12 28 15.5817 28 20V28H20C15.5817 28 12 24.4183 12 20V20Z" fill="white" fillOpacity="0.9" />
                <circle cx="20" cy="20" r="4" fill="url(#logo-gradient)" />
                <defs>
                  <linearGradient id="logo-gradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#6366f1" />
                    <stop offset="1" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="auth-layout__logo-text">LeaveFlow</span>
            </div>
            <p className="auth-layout__tagline">
              Gestion intelligente des congés pour votre entreprise
            </p>
          </div>
          
          <div className="auth-layout__card animate-slide-up">
            <Outlet />
          </div>
          
          <footer className="auth-layout__footer">
            <p>&copy; {new Date().getFullYear()} LeaveFlow. Tous droits réservés.</p>
          </footer>
        </div>
      </div>
    </div>
  )
}

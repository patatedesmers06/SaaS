import { useEffect, useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@stores/authStore'
import { useThemeStore } from '@stores/themeStore'
import { 
  LayoutDashboard, 
  CalendarPlus, 
  ClipboardList,
  Users,
  CheckSquare,
  Settings,
  Building2,
  FileBarChart,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  ChevronDown,
  Calendar
} from 'lucide-react'
import './DashboardLayout.css'

const navigation = {
  employee: [
    { name: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Nouvelle demande', href: '/new-request', icon: CalendarPlus },
    { name: 'Mes demandes', href: '/my-requests', icon: ClipboardList },
  ],
  manager: [
    { name: 'Mon équipe', href: '/team', icon: Users },
    { name: 'Validations', href: '/approvals', icon: CheckSquare },
  ],
  admin: [
    { name: 'Administration', href: '/admin', icon: Building2 },
    { name: 'Utilisateurs', href: '/admin/users', icon: Users },
    { name: 'Équipes', href: '/admin/teams', icon: Calendar },
    { name: 'Types de congés', href: '/admin/leave-types', icon: ClipboardList },
    { name: 'Paramètres', href: '/admin/settings', icon: Settings },
    { name: 'Rapports', href: '/admin/reports', icon: FileBarChart },
  ],
}

export default function DashboardLayout() {
  const navigate = useNavigate()
  const { user, logout, initialize,isInitialized } = useAuthStore()
  const { resolvedTheme, toggleTheme } = useThemeStore()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  useEffect(() => {
    if (!isInitialized) {
      initialize()
    }
  }, [isInitialized, initialize])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const getNavigationItems = () => {
    if (!user) return []
    
    const items = [...navigation.employee]
    
    if (['manager', 'hr', 'admin'].includes(user.role)) {
      items.push(...navigation.manager)
    }
    
    if (['hr', 'admin'].includes(user.role)) {
      items.push(...navigation.admin)
    }
    
    return items
  }

  const navItems = getNavigationItems()

  const getRoleBadge = (role: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      employee: { label: 'Employé', className: 'badge-info' },
      manager: { label: 'Manager', className: 'badge-primary' },
      hr: { label: 'RH', className: 'badge-warning' },
      admin: { label: 'Admin', className: 'badge-danger' },
    }
    return badges[role] || badges.employee
  }

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__header">
          <div className="sidebar__logo">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="40" rx="10" fill="url(#logo-gradient-sidebar)" />
              <path d="M12 20C12 15.5817 15.5817 12 20 12V12C24.4183 12 28 15.5817 28 20V28H20C15.5817 28 12 24.4183 12 20V20Z" fill="white" fillOpacity="0.9" />
              <circle cx="20" cy="20" r="4" fill="url(#logo-gradient-sidebar)" />
              <defs>
                <linearGradient id="logo-gradient-sidebar" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#6366f1" />
                  <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
            <span>LeaveFlow</span>
          </div>
          <button 
            className="sidebar__close btn-ghost"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Fermer le menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar__nav">
          {navItems.slice(0, 3).map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) => 
                `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
              }
              onClick={() => setIsSidebarOpen(false)}
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </NavLink>
          ))}
          
          {['manager', 'hr', 'admin'].includes(user?.role || '') && (
            <>
              <div className="sidebar__divider">
                <span>Gestion</span>
              </div>
              {navItems.slice(3, 5).map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) => 
                    `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
                  }
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <item.icon size={20} />
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </>
          )}
          
          {['hr', 'admin'].includes(user?.role || '') && (
            <>
              <div className="sidebar__divider">
                <span>Administration</span>
              </div>
              {navItems.slice(5).map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) => 
                    `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
                  }
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <item.icon size={20} />
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </>
          )}
        </nav>

        <div className="sidebar__footer">
          <button 
            className="sidebar__link sidebar__link--logout"
            onClick={handleLogout}
          >
            <LogOut size={20} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="dashboard-main">
        {/* Header */}
        <header className="dashboard-header">
          <div className="dashboard-header__left">
            <button 
              className="dashboard-header__menu-btn btn-ghost"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Ouvrir le menu"
            >
              <Menu size={24} />
            </button>
          </div>

          <div className="dashboard-header__right">
            <button 
              className="dashboard-header__theme-btn btn-ghost"
              onClick={toggleTheme}
              aria-label="Changer de thème"
            >
              {resolvedTheme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className="dashboard-header__user">
              <button 
                className="dashboard-header__user-btn"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              >
                <div className="dashboard-header__avatar">
                  {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="dashboard-header__user-info">
                  <span className="dashboard-header__user-name">
                    {user?.full_name || 'Utilisateur'}
                  </span>
                  <span className={`badge ${getRoleBadge(user?.role || 'employee').className}`}>
                    {getRoleBadge(user?.role || 'employee').label}
                  </span>
                </div>
                <ChevronDown size={16} className={isUserMenuOpen ? 'rotate-180' : ''} />
              </button>

              {isUserMenuOpen && (
                <div className="dashboard-header__dropdown">
                  <div className="dashboard-header__dropdown-header">
                    <p className="dashboard-header__dropdown-email">{user?.email}</p>
                  </div>
                  <div className="dashboard-header__dropdown-divider" />
                  <button 
                    className="dashboard-header__dropdown-item"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} />
                    <span>Déconnexion</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

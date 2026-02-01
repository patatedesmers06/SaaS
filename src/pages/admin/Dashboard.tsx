import { Building2 } from 'lucide-react'

export default function AdminDashboard() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">
          <Building2 size={28} />
          Administration
        </h1>
        <p className="page-subtitle">Vue d'ensemble de l'entreprise.</p>
      </div>
      
      <div className="card">
        <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', padding: 'var(--space-8)' }}>
          🚧 Dashboard admin en cours de développement...
        </p>
      </div>
    </div>
  )
}

import { Users } from 'lucide-react'

export default function TeamDashboard() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">
          <Users size={28} />
          Mon équipe
        </h1>
        <p className="page-subtitle">Vue d'ensemble des absences de votre équipe.</p>
      </div>
      
      <div className="card">
        <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', padding: 'var(--space-8)' }}>
          🚧 Calendrier d'équipe en cours de développement...
        </p>
      </div>
    </div>
  )
}

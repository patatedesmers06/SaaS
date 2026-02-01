import { Calendar } from 'lucide-react'

export default function TeamsManagement() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">
          <Calendar size={28} />
          Gestion des équipes
        </h1>
        <p className="page-subtitle">Configurez les équipes et leurs règles.</p>
      </div>
      
      <div className="card">
        <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', padding: 'var(--space-8)' }}>
          🚧 Gestion des équipes en cours de développement...
        </p>
      </div>
    </div>
  )
}

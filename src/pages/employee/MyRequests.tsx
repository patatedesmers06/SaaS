import { ClipboardList } from 'lucide-react'

export default function MyRequests() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">
          <ClipboardList size={28} />
          Mes demandes
        </h1>
        <p className="page-subtitle">Historique de toutes vos demandes de congés.</p>
      </div>
      
      <div className="card">
        <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', padding: 'var(--space-8)' }}>
          🚧 Liste des demandes en cours de développement...
        </p>
      </div>
    </div>
  )
}

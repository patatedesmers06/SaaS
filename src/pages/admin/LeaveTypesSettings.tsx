import { ClipboardList } from 'lucide-react'

export default function LeaveTypesSettings() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">
          <ClipboardList size={28} />
          Types de congés
        </h1>
        <p className="page-subtitle">Configurez les types de congés disponibles.</p>
      </div>
      
      <div className="card">
        <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', padding: 'var(--space-8)' }}>
          🚧 Configuration des types de congés en cours de développement...
        </p>
      </div>
    </div>
  )
}

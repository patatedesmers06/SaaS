import { CheckSquare } from 'lucide-react'

export default function Approvals() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">
          <CheckSquare size={28} />
          Validations
        </h1>
        <p className="page-subtitle">Demandes en attente de votre validation.</p>
      </div>
      
      <div className="card">
        <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', padding: 'var(--space-8)' }}>
          🚧 Interface de validation en cours de développement...
        </p>
      </div>
    </div>
  )
}

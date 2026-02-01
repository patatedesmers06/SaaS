import { CalendarPlus } from 'lucide-react'

export default function NewRequest() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">
          <CalendarPlus size={28} />
          Nouvelle demande de congé
        </h1>
        <p className="page-subtitle">Remplissez le formulaire pour soumettre votre demande.</p>
      </div>
      
      <div className="card" style={{ maxWidth: 600 }}>
        <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', padding: 'var(--space-8)' }}>
          🚧 Formulaire en cours de développement...
        </p>
      </div>
    </div>
  )
}

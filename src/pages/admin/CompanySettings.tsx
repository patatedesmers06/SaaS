import { Settings } from 'lucide-react'

export default function CompanySettings() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">
          <Settings size={28} />
          Paramètres
        </h1>
        <p className="page-subtitle">Configurez les paramètres de votre entreprise.</p>
      </div>
      
      <div className="card">
        <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', padding: 'var(--space-8)' }}>
          🚧 Paramètres entreprise en cours de développement...
        </p>
      </div>
    </div>
  )
}

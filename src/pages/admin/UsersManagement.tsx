import { Users } from 'lucide-react'

export default function UsersManagement() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">
          <Users size={28} />
          Gestion des utilisateurs
        </h1>
        <p className="page-subtitle">Gérez les employés de votre entreprise.</p>
      </div>
      
      <div className="card">
        <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', padding: 'var(--space-8)' }}>
          🚧 Gestion des utilisateurs en cours de développement...
        </p>
      </div>
    </div>
  )
}

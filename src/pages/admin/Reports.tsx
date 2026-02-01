import { FileBarChart } from 'lucide-react'

export default function Reports() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">
          <FileBarChart size={28} />
          Rapports
        </h1>
        <p className="page-subtitle">Exportez et analysez les données de congés.</p>
      </div>
      
      <div className="card">
        <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', padding: 'var(--space-8)' }}>
          🚧 Rapports et exports en cours de développement...
        </p>
      </div>
    </div>
  )
}

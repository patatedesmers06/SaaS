import { Calendar, ClipboardList, TrendingUp, Clock } from 'lucide-react'
import './Dashboard.css'

// Placeholder data for demo
const mockBalances = [
  { type: 'Congés Payés', code: 'CP', remaining: 18, total: 25, color: '#6366f1' },
  { type: 'RTT', code: 'RTT', remaining: 7, total: 10, color: '#10b981' },
  { type: 'Sans Solde', code: 'SS', remaining: null, total: null, color: '#64748b' },
]

const mockPendingRequests = [
  { id: '1', type: 'CP', startDate: '2026-02-10', endDate: '2026-02-14', days: 5, status: 'pending' },
]

const mockUpcomingLeaves = [
  { id: '2', type: 'RTT', startDate: '2026-02-21', endDate: '2026-02-21', days: 1, status: 'approved' },
]

export default function EmployeeDashboard() {
  return (
    <div className="employee-dashboard">
      <div className="page-header">
        <h1 className="page-title">Tableau de bord</h1>
        <p className="page-subtitle">Bienvenue ! Voici un aperçu de vos congés.</p>
      </div>

      {/* Leave Balances */}
      <section className="dashboard-section">
        <h2 className="section-title">
          <TrendingUp size={20} />
          Mes soldes
        </h2>
        <div className="balance-cards">
          {mockBalances.map((balance) => (
            <div key={balance.code} className="balance-card">
              <div className="balance-card__header">
                <span 
                  className="balance-card__indicator"
                  style={{ backgroundColor: balance.color }}
                />
                <span className="balance-card__type">{balance.type}</span>
              </div>
              <div className="balance-card__content">
                {balance.remaining !== null ? (
                  <>
                    <span className="balance-card__value">{balance.remaining}</span>
                    <span className="balance-card__unit">
                      / {balance.total} jours
                    </span>
                  </>
                ) : (
                  <span className="balance-card__na">Sur demande</span>
                )}
              </div>
              {balance.remaining !== null && (
                <div className="balance-card__progress">
                  <div 
                    className="balance-card__progress-bar"
                    style={{ 
                      width: `${((balance.total! - balance.remaining) / balance.total!) * 100}%`,
                      backgroundColor: balance.color 
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <div className="dashboard-grid">
        {/* Pending Requests */}
        <section className="dashboard-section">
          <h2 className="section-title">
            <Clock size={20} />
            Demandes en attente
          </h2>
          {mockPendingRequests.length > 0 ? (
            <div className="request-list">
              {mockPendingRequests.map((request) => (
                <div key={request.id} className="request-item">
                  <div className="request-item__info">
                    <span className="badge badge-primary">{request.type}</span>
                    <span className="request-item__dates">
                      {new Date(request.startDate).toLocaleDateString('fr-FR')} 
                      {request.startDate !== request.endDate && (
                        <> → {new Date(request.endDate).toLocaleDateString('fr-FR')}</>
                      )}
                    </span>
                  </div>
                  <div className="request-item__meta">
                    <span className="request-item__days">{request.days} jour{request.days > 1 ? 's' : ''}</span>
                    <span className="badge status-pending">En attente</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <ClipboardList size={32} />
              <p>Aucune demande en attente</p>
            </div>
          )}
        </section>

        {/* Upcoming Leaves */}
        <section className="dashboard-section">
          <h2 className="section-title">
            <Calendar size={20} />
            Congés à venir
          </h2>
          {mockUpcomingLeaves.length > 0 ? (
            <div className="request-list">
              {mockUpcomingLeaves.map((leave) => (
                <div key={leave.id} className="request-item">
                  <div className="request-item__info">
                    <span className="badge badge-primary">{leave.type}</span>
                    <span className="request-item__dates">
                      {new Date(leave.startDate).toLocaleDateString('fr-FR')}
                      {leave.startDate !== leave.endDate && (
                        <> → {new Date(leave.endDate).toLocaleDateString('fr-FR')}</>
                      )}
                    </span>
                  </div>
                  <div className="request-item__meta">
                    <span className="request-item__days">{leave.days} jour{leave.days > 1 ? 's' : ''}</span>
                    <span className="badge status-approved">Approuvé</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Calendar size={32} />
              <p>Aucun congé à venir</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

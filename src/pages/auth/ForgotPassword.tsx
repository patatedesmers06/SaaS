import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@stores/authStore'
import { AlertCircle, ArrowLeft, Mail, CheckCircle } from 'lucide-react'

export default function ForgotPassword() {
  const { resetPassword, isLoading, error, clearError } = useAuthStore()
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    clearError()
    
    if (!email) return
    
    await resetPassword(email)
    
    if (!error) {
      setIsSubmitted(true)
    }
  }

  if (isSubmitted) {
    return (
      <div className="auth-form">
        <div className="auth-form__header">
          <div style={{ 
            width: 64, 
            height: 64, 
            borderRadius: 'var(--radius-full)', 
            background: 'var(--color-success-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto var(--space-4)'
          }}>
            <CheckCircle size={32} color="var(--color-success)" />
          </div>
          <h1 className="auth-form__title">Email envoyé !</h1>
          <p className="auth-form__subtitle">
            Si un compte existe avec l'adresse <strong>{email}</strong>, 
            vous recevrez un lien de réinitialisation dans quelques minutes.
          </p>
        </div>

        <p style={{ 
          fontSize: 'var(--text-sm)', 
          color: 'var(--color-text-secondary)',
          textAlign: 'center'
        }}>
          Vérifiez également votre dossier spam si vous ne recevez rien.
        </p>

        <Link to="/login" className="btn btn-secondary" style={{ width: '100%' }}>
          <ArrowLeft size={20} />
          Retour à la connexion
        </Link>
      </div>
    )
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="auth-form__header">
        <h1 className="auth-form__title">Mot de passe oublié</h1>
        <p className="auth-form__subtitle">
          Entrez votre email et nous vous enverrons un lien de réinitialisation.
        </p>
      </div>

      {error && (
        <div className="auth-form__error">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="auth-form__fields">
        <div className="form-group">
          <label className="form-label" htmlFor="email">
            Adresse email
          </label>
          <input
            id="email"
            type="email"
            className="form-input"
            placeholder="votre@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            disabled={isLoading}
          />
        </div>
      </div>

      <button 
        type="submit" 
        className="btn btn-primary btn-lg"
        disabled={isLoading || !email}
        style={{ width: '100%' }}
      >
        {isLoading ? (
          <>
            <div className="spinner" style={{ width: 20, height: 20 }} />
            Envoi...
          </>
        ) : (
          <>
            <Mail size={20} />
            Envoyer le lien
          </>
        )}
      </button>

      <p className="auth-form__footer">
        <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <ArrowLeft size={16} />
          Retour à la connexion
        </Link>
      </p>
    </form>
  )
}

import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@stores/authStore'
import { AlertCircle, Eye, EyeOff, UserPlus } from 'lucide-react'

export default function Register() {
  const { register, isLoading, error, clearError } = useAuthStore()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [localError, setLocalError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    clearError()
    setLocalError('')
    
    if (!fullName || !email || !password || !confirmPassword) return
    
    if (password.length < 8) {
      setLocalError('Le mot de passe doit contenir au moins 8 caractères')
      return
    }
    
    if (password !== confirmPassword) {
      setLocalError('Les mots de passe ne correspondent pas')
      return
    }
    
    await register(email, password, fullName)
  }

  const displayError = localError || error

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="auth-form__header">
        <h1 className="auth-form__title">Créer un compte</h1>
        <p className="auth-form__subtitle">
          Rejoignez LeaveFlow pour gérer vos congés.
        </p>
      </div>

      {displayError && (
        <div className="auth-form__error">
          <AlertCircle size={16} />
          <span>{displayError}</span>
        </div>
      )}

      <div className="auth-form__fields">
        <div className="form-group">
          <label className="form-label" htmlFor="fullName">
            Nom complet
          </label>
          <input
            id="fullName"
            type="text"
            className="form-input"
            placeholder="Jean Dupont"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            autoComplete="name"
            disabled={isLoading}
          />
        </div>

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

        <div className="form-group">
          <label className="form-label" htmlFor="password">
            Mot de passe
          </label>
          <div className="password-input">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className="form-input"
              placeholder="Minimum 8 caractères"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              disabled={isLoading}
            />
            <button
              type="button"
              className="password-input__toggle"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <p className="form-hint">Minimum 8 caractères</p>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="confirmPassword">
            Confirmer le mot de passe
          </label>
          <input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            className="form-input"
            placeholder="Répétez votre mot de passe"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
            disabled={isLoading}
          />
        </div>
      </div>

      <button 
        type="submit" 
        className="btn btn-primary btn-lg"
        disabled={isLoading || !fullName || !email || !password || !confirmPassword}
        style={{ width: '100%' }}
      >
        {isLoading ? (
          <>
            <div className="spinner" style={{ width: 20, height: 20 }} />
            Création...
          </>
        ) : (
          <>
            <UserPlus size={20} />
            Créer mon compte
          </>
        )}
      </button>

      <p className="auth-form__footer">
        Déjà un compte ?{' '}
        <Link to="/login">Se connecter</Link>
      </p>
    </form>
  )
}

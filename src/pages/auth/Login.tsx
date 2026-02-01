import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@stores/authStore'
import { AlertCircle, Eye, EyeOff, LogIn } from 'lucide-react'

export default function Login() {
  const { login, isLoading, error, clearError } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    clearError()
    
    if (!email || !password) return
    
    await login(email, password)
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="auth-form__header">
        <h1 className="auth-form__title">Connexion</h1>
        <p className="auth-form__subtitle">
          Bienvenue ! Connectez-vous pour continuer.
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

        <div className="form-group">
          <label className="form-label" htmlFor="password">
            Mot de passe
          </label>
          <div className="password-input">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
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
        </div>

        <div className="auth-form__forgot">
          <Link to="/forgot-password">Mot de passe oublié ?</Link>
        </div>
      </div>

      <button 
        type="submit" 
        className="btn btn-primary btn-lg"
        disabled={isLoading || !email || !password}
        style={{ width: '100%' }}
      >
        {isLoading ? (
          <>
            <div className="spinner" style={{ width: 20, height: 20 }} />
            Connexion...
          </>
        ) : (
          <>
            <LogIn size={20} />
            Se connecter
          </>
        )}
      </button>

      <p className="auth-form__footer">
        Pas encore de compte ?{' '}
        <Link to="/register">Créer un compte</Link>
      </p>
    </form>
  )
}

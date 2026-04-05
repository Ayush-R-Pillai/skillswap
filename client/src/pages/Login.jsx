import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function AuthHero({ quote, author, title, subtitle }) {
  return (
    <div className="hero-pane surface-grid">
      <div className="floating-orb" style={{ top: '6%', left: '10%', width: '170px', height: '170px', background: 'radial-gradient(circle, rgba(137,81,255,0.34), transparent 70%)' }} />
      <div className="floating-orb" style={{ right: '8%', bottom: '6%', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(33,195,252,0.22), transparent 70%)', animationDelay: '-4s' }} />
      <div className="eyebrow"><Sparkles size={14} /> SkillSwap Workspace</div>
      <div style={{ maxWidth: '620px', marginTop: '120px' }}>
        <h1 className="section-heading" style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)' }}>{title}</h1>
        <p className="section-subtitle" style={{ marginTop: '16px', fontSize: '1rem', maxWidth: '520px' }}>{subtitle}</p>
      </div>
      <div className="glass-card soft" style={{ marginTop: 'auto', padding: '22px', maxWidth: '520px' }}>
        <blockquote style={{ margin: 0, fontSize: '1.06rem', lineHeight: 1.7 }}>“{quote}”</blockquote>
        <div style={{ marginTop: '12px', color: 'var(--muted)' }}>{author}</div>
      </div>
    </div>
  )
}

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch {
      setError('Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-shell page-shell" style={{ paddingTop: 0, minHeight: '100vh' }}>
      <AuthHero
        title="Welcome back to your learning cockpit"
        subtitle="Track sessions, discover mentors, and manage every exchange from one premium dark workspace."
        quote="SkillSwap made peer learning feel like using a polished product, not juggling spreadsheets and DMs."
        author="Sarah Chen, full-stack developer"
      />

      <div className="form-pane">
        <div className="glass-card auth-panel">
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '16px', display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg, rgba(137,81,255,0.28), rgba(14,67,251,0.24))', fontWeight: 800 }}>SS</div>
            <div>
              <div className="gradient-text" style={{ fontWeight: 800, fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>SkillSwap</div>
              <div style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>Sign in</div>
            </div>
          </Link>

          <div style={{ marginBottom: '20px' }}>
            <h1 className="section-heading" style={{ fontSize: '2rem', marginBottom: '8px' }}>Sign in</h1>
            <p className="section-subtitle" style={{ marginTop: 0 }}>Enter your credentials to continue your learning journey.</p>
          </div>

          {error && <div className="glass-card soft" style={{ padding: '12px 14px', color: '#ff9bb7', marginBottom: '16px' }}>{error}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '14px' }}>
            <div className="field-shell">
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" required />
              <label>Email address</label>
            </div>
            <div className="field-shell">
              <input type={showPass ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" required />
              <label>Password</label>
              <button type="button" onClick={() => setShowPass((prev) => !prev)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 0, color: 'var(--muted)', cursor: 'pointer' }}>
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <button type="submit" className="gradient-button" disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="glass-card soft" style={{ padding: '12px 14px', marginTop: '16px', color: 'var(--muted)', fontSize: '0.86rem' }}>
            Demo credentials: <strong style={{ color: 'var(--text)' }}>ayush@example.com</strong> / <strong style={{ color: 'var(--text)' }}>password</strong>
          </div>

          <p style={{ color: 'var(--muted)', marginTop: '18px' }}>
            New here? <Link to="/register" className="gradient-text" style={{ fontWeight: 700 }}>Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  )
}


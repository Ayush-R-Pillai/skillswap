import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff } from 'lucide-react'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!agreed) { setError('Please agree to the Terms of Service.'); return }
    setError(''); setLoading(true)
    try {
      await register(name, email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err?.response?.data?.error || 'Registration failed. Try again.')
    } finally { setLoading(false) }
  }

  const field = { border: '2px solid #E5E7EB', borderRadius: '10px', padding: '11px 14px', fontSize: '0.95rem', width: '100%', color: '#1A1A1A', background: '#fff', transition: 'border-color 0.15s' }

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left */}
      <div style={{ flex: 1, background: 'linear-gradient(135deg, #14B8A6, #2563EB)', display: 'none', position: 'relative', overflow: 'hidden' }} className="reg-left">
        <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80" alt="Learning" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.45 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0d9488cc, transparent)', display: 'flex', alignItems: 'flex-end', padding: '3rem' }}>
          <div style={{ color: '#fff', maxWidth: '420px' }}>
            <blockquote style={{ fontSize: '1.3rem', fontWeight: 500, lineHeight: 1.5, marginBottom: '1rem', fontStyle: 'italic' }}>
              "The best investment you can make is in yourself. SkillSwap makes it easy to learn from the best."
            </blockquote>
            <p style={{ opacity: 0.8, fontWeight: 600 }}>— Marcus Williams, UI/UX Designer</p>
          </div>
        </div>
      </div>

      {/* Right */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: '#FAFBFC', minWidth: '360px' }}>
        <div style={{ width: '100%', maxWidth: '440px', background: '#fff', border: '2px solid #E5E7EB', borderRadius: '20px', padding: '2.5rem', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
              <div style={{ width: '48px', height: '48px', background: '#2563EB', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '1rem' }}>SS</div>
              <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1A1A1A' }}>SkillSwap</span>
            </Link>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1A1A1A', letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>Create your account</h1>
            <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>Start your learning journey today</p>
          </div>

          {error && <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '10px 14px', color: '#DC2626', fontSize: '0.875rem', marginBottom: '1.25rem' }}>{error}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '6px', color: '#1A1A1A' }}>Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" required
                style={field} onFocus={e => e.target.style.borderColor = '#2563EB'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '6px', color: '#1A1A1A' }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required
                style={field} onFocus={e => e.target.style.borderColor = '#2563EB'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '6px', color: '#1A1A1A' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={8}
                  style={{ ...field, paddingRight: '44px' }}
                  onFocus={e => e.target.style.borderColor = '#2563EB'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '5px' }}>Must be at least 8 characters</p>
            </div>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ width: '16px', height: '16px', marginTop: '2px', accentColor: '#2563EB' }} />
              <span style={{ fontSize: '0.85rem', color: '#6B7280', lineHeight: 1.5 }}>
                I agree to the <a href="#" style={{ color: '#2563EB' }}>Terms of Service</a> and <a href="#" style={{ color: '#2563EB' }}>Privacy Policy</a>
              </span>
            </label>

            <button type="submit" disabled={loading} style={{ padding: '12px', background: '#2563EB', color: '#fff', borderRadius: '10px', fontWeight: 700, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, boxShadow: '0 4px 12px #2563EB30', marginTop: '4px' }}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#9CA3AF', fontSize: '0.8rem' }}>
              <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }} />
              <span>Or continue with</span>
              <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }} />
            </div>

            <button type="button" style={{ padding: '11px', border: '2px solid #E5E7EB', borderRadius: '10px', background: '#fff', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#1A1A1A' }}>
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#6B7280', marginTop: '1.5rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#2563EB', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>

      <style>{`@media(min-width:768px){.reg-left{display:block!important}}`}</style>
    </div>
  )
}
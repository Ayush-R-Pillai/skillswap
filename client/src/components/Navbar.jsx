import { useMemo, useState } from 'react'
import { Bell, ChevronDown, Compass, LayoutDashboard, LogOut, Menu, UserCircle2, X } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    setProfileOpen(false)
    setMobileOpen(false)
    navigate('/')
  }

  const navItems = useMemo(() => ([
    { to: '/browse', label: 'Browse', icon: Compass },
    ...(user ? [{ to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }] : []),
  ]), [user])

  const linkStyle = (active) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 14px',
    borderRadius: '14px',
    color: active ? '#f7f9ff' : 'var(--muted)',
    background: active ? 'rgba(137, 81, 255, 0.16)' : 'transparent',
    border: `1px solid ${active ? 'rgba(137, 81, 255, 0.22)' : 'transparent'}`,
    fontWeight: active ? 700 : 600,
    transition: 'all 0.2s ease',
  })

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 'var(--nav-height)',
        padding: '16px 22px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(22px)',
        background: 'linear-gradient(180deg, rgba(8, 16, 31, 0.94), rgba(8, 16, 31, 0.72))',
        zIndex: 100,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button
          type="button"
          className="ghost-button hide-desktop"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '16px',
              display: 'grid',
              placeItems: 'center',
              background: 'linear-gradient(135deg, rgba(137,81,255,0.32), rgba(14,67,251,0.3))',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 18px 38px rgba(14,67,251,0.22)',
            }}
          >
            <span style={{ fontWeight: 800, letterSpacing: '-0.04em' }}>SS</span>
          </div>
          <div>
            <div className="gradient-text" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem' }}>
              SkillSwap
            </div>
            <div className="hide-mobile" style={{ fontSize: '0.76rem', color: 'var(--muted)', marginTop: '2px' }}>
              Peer learning marketplace
            </div>
          </div>
        </Link>
      </div>

      <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {navItems.map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to} style={linkStyle(location.pathname.startsWith(to))}>
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {user ? (
          <>
            <button
              type="button"
              className="secondary-button"
              style={{
                width: '46px',
                height: '46px',
                padding: 0,
                borderRadius: '16px',
                display: 'grid',
                placeItems: 'center',
              }}
              title="Notifications"
            >
              <Bell size={18} />
            </button>
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className="secondary-button"
                onClick={() => setProfileOpen((prev) => !prev)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '8px 10px 8px 8px',
                  borderRadius: '18px',
                }}
              >
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '12px',
                    display: 'grid',
                    placeItems: 'center',
                    background: 'linear-gradient(135deg, rgba(137,81,255,0.32), rgba(33,195,252,0.24))',
                    fontWeight: 800,
                  }}
                >
                  {user.name?.[0]?.toUpperCase() || 'S'}
                </div>
                <div className="hide-mobile" style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>{user.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>Workspace</div>
                </div>
                <ChevronDown size={16} />
              </button>
              {profileOpen && (
                <div
                  className="glass-card"
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 12px)',
                    width: '240px',
                    padding: '12px',
                    animation: 'riseIn 0.18s ease',
                  }}
                >
                  <Link
                    to={`/profile/${user.id}`}
                    onClick={() => setProfileOpen(false)}
                    style={{ ...linkStyle(location.pathname.startsWith('/profile')), width: '100%' }}
                  >
                    <UserCircle2 size={16} />
                    View profile
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      marginTop: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 14px',
                      borderRadius: '14px',
                      border: '1px solid rgba(255,255,255,0.08)',
                      background: 'transparent',
                      color: 'var(--muted)',
                      fontWeight: 600,
                    }}
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className="ghost-button">Login</Link>
            <Link to="/register" className="gradient-button">Get started</Link>
          </>
        )}
      </div>

      {mobileOpen && (
        <div
          className="glass-card"
          style={{
            position: 'absolute',
            left: '18px',
            right: '18px',
            top: 'calc(100% + 12px)',
            padding: '12px',
            display: 'grid',
            gap: '8px',
          }}
        >
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} onClick={() => setMobileOpen(false)} style={linkStyle(location.pathname.startsWith(to))}>
              <Icon size={16} />
              {label}
            </Link>
          ))}
          {!user && (
            <>
              <Link to="/login" onClick={() => setMobileOpen(false)} style={linkStyle(location.pathname === '/login')}>
                Login
              </Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="gradient-button" style={{ textAlign: 'center' }}>
                Get started
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}

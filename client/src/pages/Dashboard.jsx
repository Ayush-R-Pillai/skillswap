import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  GraduationCap,
  LayoutDashboard,
  MessageSquare,
  Plus,
  Settings,
  Sparkles,
  Star,
  UserRound,
  X,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

const NAV = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'skills', label: 'My Skills', icon: GraduationCap },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'settings', label: 'Settings', icon: Settings },
]

const LEVEL_GLOW = {
  Beginner: 'rgba(61, 217, 164, 0.32)',
  Intermediate: 'rgba(33, 195, 252, 0.3)',
  Advanced: 'rgba(137, 81, 255, 0.32)',
}

function AvatarEl({ name, photo, size = 44 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: Math.max(16, size * 0.36),
        flexShrink: 0,
        display: 'grid',
        placeItems: 'center',
        fontSize: size * 0.34,
        fontWeight: 800,
        color: 'white',
        background: 'linear-gradient(135deg, rgba(137,81,255,0.92), rgba(33,195,252,0.86))',
        boxShadow: '0 18px 40px rgba(33, 195, 252, 0.2)',
        overflow: 'hidden',
      }}
    >
      {photo ? (
        <img
          src={photo}
          alt={name || 'User'}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        (name || '?')[0].toUpperCase()
      )}
    </div>
  )
}

function CountNumber({ value }) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    let frame
    const duration = 700
    const startedAt = performance.now()

    const tick = (now) => {
      const progress = Math.min((now - startedAt) / duration, 1)
      setDisplayValue(Math.round(value * progress))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value])

  return <>{displayValue}</>
}

export default function Dashboard() {
  const { user } = useAuth()
  const [tab, setTab] = useState('overview')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sessions, setSessions] = useState([])
  const [allSkills, setAllSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    if (!user) return
    Promise.all([
      api.get('/sessions/me').catch(() => ({ data: [] })),
      api.get('/skills').catch(() => ({ data: [] })),
    ]).then(([sessRes, skillRes]) => {
      setSessions(sessRes.data || [])
      setAllSkills(skillRes.data || [])
      setLoading(false)
    })
  }, [user])

  const teaching = sessions.filter((session) => session.teacher === user?.id)
  const learning = sessions.filter((session) => session.learner === user?.id)
  const upcoming = sessions
    .filter((session) => session.status === 'confirmed')
    .sort((a, b) => new Date(a.scheduledAt || a.date || 0) - new Date(b.scheduledAt || b.date || 0))
  const pending = sessions.filter((session) => session.status === 'pending' && session.teacher === user?.id)
  const completed = sessions.filter((session) => session.status === 'completed')

  const mySkills = useMemo(
    () => allSkills.filter((skill) => skill.offeredBy === user?.id || skill.userId === user?.id),
    [allSkills, user?.id],
  )

  const activity = useMemo(
    () => sessions.slice(0, 5).map((session) => ({
      id: session.id,
      title: session.skillData?.title || 'Session update',
      detail: session.status === 'confirmed' ? 'Session confirmed' : session.status === 'completed' ? 'Session completed' : 'Awaiting confirmation',
      at: new Date(session.scheduledAt || Date.now()).toLocaleDateString(),
      status: session.status || 'pending',
    })),
    [sessions],
  )

  const completionRate = sessions.length ? Math.round((completed.length / sessions.length) * 100) : 0

  const handleStatus = async (id, status) => {
    try {
      setActionError('')
      const response = await api.put(`/sessions/${id}`, { status })
      setSessions((prev) => prev.map((session) => (session.id === id ? { ...session, ...response.data } : session)))
    } catch (error) {
      console.error(error)
      setActionError(error?.response?.data?.message || 'Unable to update this session right now.')
    }
  }

  const activeTab = NAV.find((item) => item.id === tab)

  return (
    <div className="page-shell">
      <div className="page-content">
        <div className="dashboard-layout">
          <aside className={`glass-card sidebar-panel ${sidebarCollapsed ? 'collapsed' : ''}`} style={{ padding: '18px', alignSelf: 'stretch', display: 'grid', gap: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'space-between' }}>
              {!sidebarCollapsed && (
                <div className="sidebar-copy">
                  <div style={{ fontWeight: 800, fontFamily: 'var(--font-display)', fontSize: '1.05rem' }}>Control Center</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Your SaaS workspace</div>
                </div>
              )}
              <button type="button" className="ghost-button" onClick={() => setSidebarCollapsed((prev) => !prev)} style={{ padding: '10px', borderRadius: '14px' }}>
                {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </button>
            </div>

            <div
              className="glass-card soft hover-lift"
              style={{
                padding: sidebarCollapsed ? '14px 10px' : '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                gap: '12px',
              }}
            >
              <AvatarEl name={user?.name} photo={user?.profilePhoto} size={sidebarCollapsed ? 44 : 48} />
              {!sidebarCollapsed && (
                <div className="sidebar-copy" style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'SkillSwapper'}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email || 'dashboard@skillswap.app'}</div>
                </div>
              )}
            </div>

            <nav style={{ display: 'grid', gap: '10px' }}>
              {NAV.map(({ id, label, icon: Icon }) => {
                const active = tab === id
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTab(id)}
                    title={sidebarCollapsed ? label : undefined}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                      gap: '12px',
                      width: '100%',
                      padding: sidebarCollapsed ? '14px' : '14px 16px',
                      borderRadius: '18px',
                      border: `1px solid ${active ? 'rgba(137,81,255,0.26)' : 'rgba(255,255,255,0.05)'}`,
                      background: active ? 'linear-gradient(135deg, rgba(137,81,255,0.18), rgba(14,67,251,0.12))' : 'rgba(255,255,255,0.02)',
                      color: active ? '#f4f7ff' : 'var(--muted)',
                      fontWeight: active ? 700 : 600,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <Icon size={18} />
                    {!sidebarCollapsed && <span className="sidebar-copy">{label}</span>}
                  </button>
                )
              })}
            </nav>

            {!sidebarCollapsed && (
              <div className="glass-card soft sidebar-copy" style={{ marginTop: 'auto', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <Sparkles size={16} color="#21C3FC" />
                  <span style={{ fontWeight: 700 }}>Weekly momentum</span>
                </div>
                <div style={{ color: 'var(--muted)', fontSize: '0.86rem' }}>You are ahead of 74% of learners based on completed sessions this week.</div>
              </div>
            )}
          </aside>

          <main style={{ flex: 1, minWidth: 0, display: 'grid', gap: '22px' }}>
            <section className="glass-card surface-grid" style={{ padding: '28px', position: 'relative', overflow: 'hidden' }}>
              <div className="floating-orb" style={{ top: '8%', right: '8%', width: '120px', height: '120px', background: 'radial-gradient(circle, rgba(137,81,255,0.34), transparent 70%)' }} />
              <div className="floating-orb" style={{ bottom: '5%', left: '18%', width: '120px', height: '120px', background: 'radial-gradient(circle, rgba(33,195,252,0.24), transparent 70%)', animationDelay: '-4s' }} />
              <div className="eyebrow">Live workspace</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', marginTop: '18px', flexWrap: 'wrap' }}>
                <div>
                  <h1 className="section-heading" style={{ marginBottom: '8px' }}>
                    Welcome back, {user?.name?.split(' ')[0] || 'there'} <span aria-hidden="true">??</span>
                  </h1>
                  <p className="section-subtitle">Here&apos;s your learning journey overview with sessions, progress, and requests in one place.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                  <Link to="/browse" className="gradient-button" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <Plus size={16} />
                    Book New
                  </Link>
                  <div className="glass-card soft" style={{ padding: '12px 14px', minWidth: '180px' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Active tab</div>
                    <div style={{ marginTop: '4px', fontWeight: 700 }}>{activeTab?.label}</div>
                  </div>
                </div>
              </div>
            </section>

            {tab === 'overview' && (
              <>
                <section className="stats-grid">
                  {[
                    { label: 'Sessions Teaching', value: teaching.length, icon: GraduationCap, glow: 'rgba(137,81,255,0.24)' },
                    { label: 'Sessions Learning', value: learning.length, icon: BookOpen, glow: 'rgba(33,195,252,0.22)' },
                    { label: 'Completed', value: completed.length, icon: Check, glow: 'rgba(61,217,164,0.22)' },
                    { label: 'Pending', value: pending.length, icon: Clock3, glow: 'rgba(248,198,95,0.22)' },
                  ].map(({ label, value, icon: Icon, glow }) => (
                    <div key={label} className="glass-card hover-lift" style={{ padding: '22px', display: 'grid', gap: '20px', borderColor: 'rgba(255,255,255,0.08)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '8px' }}>{label}</div>
                          <div style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.04em', fontFamily: 'var(--font-display)' }}>
                            <CountNumber value={value} />
                          </div>
                        </div>
                        <div
                          style={{
                            width: '52px',
                            height: '52px',
                            borderRadius: '18px',
                            display: 'grid',
                            placeItems: 'center',
                            background: `radial-gradient(circle at 30% 20%, rgba(255,255,255,0.16), ${glow})`,
                            border: '1px solid rgba(255,255,255,0.08)',
                          }}
                        >
                          <Icon size={20} />
                        </div>
                      </div>
                      <div style={{ height: '6px', borderRadius: '999px', background: 'rgba(255,255,255,0.05)' }}>
                        <div style={{ height: '100%', width: `${Math.min(100, value * 18 + 12)}%`, borderRadius: 'inherit', background: 'linear-gradient(90deg, #8951FF, #21C3FC)' }} />
                      </div>
                    </div>
                  ))}
                </section>

                <section className="premium-tablet-stack">
                  <div className="glass-card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '18px', flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem' }}>Confirmed Sessions</div>
                        <div style={{ fontSize: '0.88rem', color: 'var(--muted)', marginTop: '4px' }}>Upcoming lessons in a timeline view</div>
                      </div>
                      <Link to="/browse" className="gradient-button" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <Plus size={16} />
                        Book New
                      </Link>
                    </div>

                    {loading ? (
                      <div className="timeline">
                        {[1, 2, 3].map((item) => (
                          <div key={item} className="timeline-item">
                            <div className="timeline-dot" />
                            <div className="glass-card soft skeleton" style={{ minHeight: '88px' }} />
                          </div>
                        ))}
                      </div>
                    ) : upcoming.length === 0 ? (
                      <div className="glass-card soft" style={{ padding: '38px 24px', textAlign: 'center' }}>
                        <Calendar size={34} style={{ margin: '0 auto 12px', opacity: 0.7 }} />
                        <div style={{ fontWeight: 700, marginBottom: '6px' }}>No confirmed sessions yet</div>
                        <div style={{ color: 'var(--muted)', marginBottom: '18px' }}>Start a new exchange to see booked sessions, reminders, and milestones here.</div>
                        <Link to="/browse" className="secondary-button">Browse teachers</Link>
                      </div>
                    ) : (
                      <div className="timeline">
                        {upcoming.map((session) => {
                          const partnerName = session.teacher === user?.id ? session.learnerData?.name : session.teacherData?.name
                          const scheduledAt = new Date(session.scheduledAt || session.date || Date.now())
                          const teachingNow = session.teacher === user?.id
                          return (
                            <div key={session.id} className="timeline-item">
                              <div className="timeline-dot" />
                              <div className="glass-card soft hover-lift" style={{ padding: '16px 18px', display: 'grid', gap: '14px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                                  <div style={{ display: 'flex', gap: '12px', minWidth: 0 }}>
                                    <AvatarEl
                                      name={partnerName}
                                      photo={session.teacher === user?.id ? session.learnerData?.profilePhoto : session.teacherData?.profilePhoto}
                                    />
                                    <div style={{ minWidth: 0 }}>
                                      <div style={{ fontWeight: 700, fontSize: '1rem' }}>{session.skillData?.title || 'Coaching session'}</div>
                                      <div style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>with {partnerName || 'your learning partner'}</div>
                                    </div>
                                  </div>
                                  <span className={`pill-badge ${session.status === 'confirmed' ? 'status-confirmed' : 'status-pending'}`}>
                                    {teachingNow ? 'Teaching' : 'Learning'}
                                  </span>
                                </div>
                                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', color: 'var(--muted)' }}>
                                  <span className="pill-badge" style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.05)' }}>
                                    <Calendar size={14} />
                                    {scheduledAt.toLocaleDateString()}
                                  </span>
                                  <span className="pill-badge" style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.05)' }}>
                                    <Clock3 size={14} />
                                    {scheduledAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'grid', gap: '22px' }}>
                    <div className="glass-card" style={{ padding: '22px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '18px', gap: '12px', flexWrap: 'wrap' }}>
                        <div>
                          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Progress Pulse</div>
                          <div style={{ color: 'var(--muted)', fontSize: '0.86rem', marginTop: '4px' }}>Completion and response health</div>
                        </div>
                        <span className="pill-badge status-confirmed">{completionRate}% complete</span>
                      </div>
                      <div style={{ display: 'grid', placeItems: 'center', padding: '8px 0 18px' }}>
                        <div
                          style={{
                            width: '190px',
                            height: '190px',
                            borderRadius: '50%',
                            display: 'grid',
                            placeItems: 'center',
                            background: `conic-gradient(#8951FF 0 ${completionRate}%, rgba(255,255,255,0.08) ${completionRate}% 100%)`,
                            animation: 'pulseGlow 2.6s infinite',
                          }}
                        >
                          <div className="glass-card soft" style={{ width: '130px', height: '130px', borderRadius: '50%', display: 'grid', placeItems: 'center' }}>
                            <div style={{ textAlign: 'center' }}>
                              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2rem' }}>{completionRate}%</div>
                              <div style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>completion</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'grid', gap: '12px' }}>
                        {[
                          { label: 'Response speed', value: pending.length ? 'Needs attention' : 'Great', color: pending.length ? 'var(--warning)' : 'var(--success)' },
                          { label: 'Active listings', value: `${mySkills.length} skills`, color: 'var(--cyan)' },
                        ].map((metric) => (
                          <div key={metric.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: '16px', background: 'rgba(255,255,255,0.04)' }}>
                            <span style={{ color: 'var(--muted)' }}>{metric.label}</span>
                            <span style={{ color: metric.color, fontWeight: 700 }}>{metric.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="glass-card" style={{ padding: '22px' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '16px' }}>Activity Feed</div>
                      <div style={{ display: 'grid', gap: '12px' }}>
                        {activity.length === 0 ? (
                          <div className="glass-card soft" style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)' }}>
                            Your latest confirmations and completions will appear here.
                          </div>
                        ) : (
                          activity.map((item) => (
                            <div key={item.id} className="glass-card soft hover-lift" style={{ padding: '14px 16px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                                <div>
                                  <div style={{ fontWeight: 700 }}>{item.title}</div>
                                  <div style={{ color: 'var(--muted)', fontSize: '0.86rem' }}>{item.detail}</div>
                                </div>
                                <span className={`pill-badge ${item.status === 'confirmed' ? 'status-confirmed' : item.status === 'completed' ? 'status-confirmed' : 'status-pending'}`}>
                                  {item.at}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </section>

                <section className="glass-card" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem' }}>
                      Pending Requests {pending.length > 0 && <span style={{ color: 'var(--warning)' }}>({pending.length})</span>}
                    </div>
                    <div style={{ color: 'var(--muted)', fontSize: '0.86rem' }}>Review or schedule outstanding asks</div>
                  </div>
                  {actionError && (
                    <div className="glass-card soft" style={{ padding: '12px 14px', marginBottom: '14px', color: '#ff9bb7' }}>
                      {actionError}
                    </div>
                  )}
                  {pending.length === 0 ? (
                    <div className="glass-card soft" style={{ padding: '28px', textAlign: 'center' }}>
                      <Check size={30} style={{ margin: '0 auto 10px', color: 'var(--success)' }} />
                      <div style={{ fontWeight: 700 }}>Inbox clear</div>
                      <div style={{ color: 'var(--muted)' }}>New requests will appear here with quick accept and decline actions.</div>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: '12px' }}>
                      {pending.map((session) => (
                        <div key={session.id} className="glass-card soft hover-lift" style={{ padding: '16px 18px', display: 'flex', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', gap: '12px', minWidth: 0 }}>
                            <AvatarEl name={session.learnerData?.name} photo={session.learnerData?.profilePhoto} />
                            <div>
                              <div style={{ fontWeight: 700 }}>{session.learnerData?.name || 'Learner'} wants to learn</div>
                              <div style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>{session.skillData?.title || 'Skill session'}</div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <button type="button" className="gradient-button" onClick={() => handleStatus(session.id, 'confirmed')} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                              <Check size={16} />
                              Accept
                            </button>
                            <button type="button" className="secondary-button" onClick={() => handleStatus(session.id, 'cancelled')} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                              <X size={16} />
                              Decline
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}

            {tab === 'skills' && (
              <section className="glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '18px', flexWrap: 'wrap' }}>
                  <div>
                    <h2 className="section-heading" style={{ fontSize: '1.8rem', marginBottom: '6px' }}>My Skills</h2>
                    <p className="section-subtitle" style={{ marginTop: 0 }}>Manage your listings and keep your teaching profile sharp.</p>
                  </div>
                  <Link to={`/profile/${user?.id}`} className="gradient-button" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <Plus size={16} />
                    Add Skill
                  </Link>
                </div>

                {loading ? (
                  <div className="card-grid">
                    {[1, 2, 3].map((item) => <div key={item} className="glass-card soft skeleton" style={{ height: '130px' }} />)}
                  </div>
                ) : mySkills.length === 0 ? (
                  <div className="glass-card soft" style={{ padding: '34px', textAlign: 'center' }}>
                    <GraduationCap size={34} style={{ margin: '0 auto 12px' }} />
                    <div style={{ fontWeight: 700 }}>No skill listings yet</div>
                    <div style={{ color: 'var(--muted)', marginBottom: '16px' }}>Build your profile to start getting session requests.</div>
                    <Link to={`/profile/${user?.id}`} className="secondary-button">Go to profile</Link>
                  </div>
                ) : (
                  <div className="card-grid">
                    {mySkills.map((skill) => (
                      <div key={skill.id} className="glass-card soft hover-lift" style={{ padding: '20px', display: 'grid', gap: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '1.02rem' }}>{skill.title}</div>
                            <div style={{ color: 'var(--muted)', fontSize: '0.86rem' }}>{skill.description || 'Ready for peer-to-peer coaching sessions.'}</div>
                          </div>
                          <div style={{ width: '44px', height: '44px', borderRadius: '16px', display: 'grid', placeItems: 'center', background: LEVEL_GLOW[skill.level] || 'rgba(255,255,255,0.12)' }}>
                            <Star size={18} />
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <span className="pill-badge" style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.08)' }}>{skill.category}</span>
                          <span className="pill-badge" style={{ background: LEVEL_GLOW[skill.level] || 'rgba(255,255,255,0.06)', borderColor: 'transparent' }}>{skill.level}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {tab === 'messages' && (
              <section className="glass-card" style={{ padding: '24px' }}>
                <h2 className="section-heading" style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Messages</h2>
                <p className="section-subtitle" style={{ marginTop: 0, marginBottom: '20px' }}>A polished messaging surface is staged here for session conversations.</p>
                <div className="glass-card soft" style={{ padding: '44px 28px', textAlign: 'center' }}>
                  <MessageSquare size={36} style={{ margin: '0 auto 12px', color: 'var(--cyan)' }} />
                  <div style={{ fontWeight: 700, marginBottom: '6px' }}>No conversations yet</div>
                  <div style={{ color: 'var(--muted)' }}>When learners and teachers start matching, this space can expand into inbox, threads, and quick actions.</div>
                </div>
              </section>
            )}

            {tab === 'settings' && (
              <section className="glass-card" style={{ padding: '24px' }}>
                <h2 className="section-heading" style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Settings</h2>
                <p className="section-subtitle" style={{ marginTop: 0, marginBottom: '20px' }}>Core account controls with the same dashboard treatment.</p>
                <div className="premium-tablet-stack">
                  <div className="glass-card soft" style={{ padding: '20px' }}>
                    <div style={{ fontWeight: 700, marginBottom: '14px' }}>Account information</div>
                    <div className="field-shell" style={{ marginBottom: '12px' }}>
                      <input value={user?.name || ''} readOnly placeholder="Name" />
                      <label>Full name</label>
                    </div>
                    <div className="field-shell">
                      <input value={user?.email || ''} readOnly placeholder="Email" />
                      <label>Email</label>
                    </div>
                  </div>
                  <div className="glass-card soft" style={{ padding: '20px' }}>
                    <div style={{ fontWeight: 700, marginBottom: '14px' }}>Profile tuning</div>
                    <div style={{ color: 'var(--muted)', marginBottom: '16px' }}>Edit bio, skills, and reviews from your public profile page.</div>
                    <Link to={`/profile/${user?.id}`} className="gradient-button" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <UserRound size={16} />
                      Edit full profile
                    </Link>
                  </div>
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}


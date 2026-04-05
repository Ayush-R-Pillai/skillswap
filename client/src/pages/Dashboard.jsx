import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Home, GraduationCap, MessageSquare, Settings, Calendar, Clock, Check, X, Plus, Star, BookOpen } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

const NAV = [
  { id: 'overview',  label: 'Overview',  icon: Home },
  { id: 'skills',   label: 'My Skills', icon: GraduationCap },
  { id: 'messages', label: 'Messages',  icon: MessageSquare },
  { id: 'settings', label: 'Settings',  icon: Settings },
]

const card = {
  background: '#fff',
  border: '1.5px solid #E5E7EB',
  borderRadius: '16px',
  padding: '1.5rem',
  boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
}

const AvatarEl = ({ name, size = 42 }) => (
  <div style={{
    width: size, height: size, borderRadius: '50%', flexShrink: 0,
    background: 'linear-gradient(135deg, #2563EB, #14B8A6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: size * 0.38, fontWeight: 700, color: '#fff',
  }}>
    {(name || '?')[0].toUpperCase()}
  </div>
)

export default function Dashboard() {
  const { user } = useAuth()
  const [tab, setTab] = useState('overview')
  const [sessions, setSessions] = useState([])
  const [mySkills, setMySkills] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    Promise.all([
      api.get('/sessions/me').catch(() => ({ data: [] })),
      api.get('/skills').catch(() => ({ data: [] })),
    ]).then(([sessRes, skillRes]) => {
      setSessions(sessRes.data || [])
      setMySkills((skillRes.data || []).filter(s => s.offeredBy === user?.id))
      setLoading(false)
    })
  }, [user])

  const teaching  = sessions.filter(s => s.teacher === user?.id)
  const learning  = sessions.filter(s => s.learner === user?.id)
  const upcoming  = sessions.filter(s => s.status === 'confirmed')
  const pending   = sessions.filter(s => s.status === 'pending' && s.teacher === user?.id)
  const completed = sessions.filter(s => s.status === 'completed')

  const handleStatus = async (id, status) => {
    try {
      await api.put(`/sessions/${id}`, { status })
      setSessions(prev => prev.map(s => s.id === id ? { ...s, status } : s))
    } catch (e) { console.error(e) }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAFBFC', display: 'flex', width: '100%' }}>

      {/* ── Sidebar ── */}
      <aside style={{ width: '240px', background: '#fff', borderRight: '1px solid #E5E7EB', minHeight: '100vh', flexShrink: 0 }}>
        <div style={{ padding: '1.5rem 1rem' }}>
          {/* User card */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: '#F3F4F6', borderRadius: '12px', marginBottom: '1.5rem' }}>
            <AvatarEl name={user?.name} size={40} />
            <div style={{ minWidth: 0 }}>
              <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1A1A1A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'User'}</p>
              <p style={{ fontSize: '0.72rem', color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email || ''}</p>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {NAV.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setTab(id)} style={{
                display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px',
                borderRadius: '10px', cursor: 'pointer', width: '100%', textAlign: 'left',
                background: tab === id ? '#2563EB' : 'transparent',
                color: tab === id ? '#fff' : '#6B7280',
                border: 'none', fontWeight: tab === id ? 600 : 500,
                fontSize: '0.9rem', transition: 'all 0.15s',
              }}>
                <Icon size={18} /> {label}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto', minWidth: 0 }}>

        {/* ══ OVERVIEW ══ */}
        {tab === 'overview' && (
          <div style={{ maxWidth: '900px' }}>
            <div style={{ marginBottom: '2rem' }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1A1A1A', letterSpacing: '-0.02em', marginBottom: '4px' }}>
                Welcome back, {user?.name?.split(' ')[0] || 'there'}! 👋
              </h1>
              <p style={{ color: '#6B7280', fontSize: '0.95rem' }}>Here's your learning journey overview</p>
            </div>

            {/* ── Real Stats (no fake data) ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              {[
                { label: 'Sessions Teaching', value: teaching.length,  icon: GraduationCap, color: '#2563EB' },
                { label: 'Sessions Learning', value: learning.length,  icon: BookOpen,      color: '#14B8A6' },
                { label: 'Completed',         value: completed.length, icon: Star,          color: '#F59E0B' },
                { label: 'Pending',           value: pending.length,   icon: Clock,         color: '#8B5CF6' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} style={card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.8rem', color: '#6B7280' }}>{label}</span>
                    <div style={{ width: '38px', height: '38px', background: `${color}15`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={18} color={color} />
                    </div>
                  </div>
                  <p style={{ fontSize: '2rem', fontWeight: 800, color: '#1A1A1A' }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Upcoming Sessions */}
            <div style={{ ...card, marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1A1A1A' }}>Confirmed Sessions</h3>
                <Link to="/browse" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '7px 14px', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, color: '#6B7280', textDecoration: 'none' }}>
                  <Plus size={14} /> Book New
                </Link>
              </div>
              {loading ? (
                <p style={{ color: '#9CA3AF', textAlign: 'center', padding: '2rem' }}>Loading...</p>
              ) : upcoming.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#9CA3AF' }}>
                  <Calendar size={32} style={{ marginBottom: '8px', opacity: 0.3 }} />
                  <p style={{ fontSize: '0.9rem' }}>No confirmed sessions. <Link to="/browse" style={{ color: '#2563EB', fontWeight: 600 }}>Browse skills →</Link></p>
                </div>
              ) : upcoming.map(s => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: '#F9FAFB', borderRadius: '10px', border: '1px solid #F3F4F6', marginBottom: '8px' }}>
                  <AvatarEl name={s.teacher === user?.id ? s.learnerData?.name : s.teacherData?.name} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1A1A1A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.skillData?.title || 'Session'}
                    </p>
                    <p style={{ fontSize: '0.78rem', color: '#6B7280' }}>
                      with {s.teacher === user?.id ? s.learnerData?.name : s.teacherData?.name}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', color: '#6B7280' }}>
                      <Calendar size={13} /> {new Date(s.scheduledAt).toLocaleDateString()}
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                      {new Date(s.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 600, background: s.teacher === user?.id ? '#EFF6FF' : '#F0FDFA', color: s.teacher === user?.id ? '#2563EB' : '#14B8A6' }}>
                    {s.teacher === user?.id ? 'Teaching' : 'Learning'}
                  </span>
                </div>
              ))}
            </div>

            {/* Pending Requests */}
            <div style={card}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1A1A1A', marginBottom: '1rem' }}>
                Pending Requests
                {pending.length > 0 && (
                  <span style={{ marginLeft: '8px', background: '#FEF3C7', color: '#D97706', borderRadius: '20px', padding: '2px 8px', fontSize: '0.72rem', fontWeight: 700 }}>
                    {pending.length}
                  </span>
                )}
              </h3>
              {pending.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: '#9CA3AF' }}>
                  <Check size={28} style={{ marginBottom: '6px', opacity: 0.3 }} />
                  <p style={{ fontSize: '0.875rem' }}>No pending requests</p>
                </div>
              ) : pending.map(s => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '12px 14px', background: '#FFFBEB', borderRadius: '10px', border: '1px solid #FDE68A', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <AvatarEl name={s.learnerData?.name} size={38} />
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1A1A1A' }}>{s.learnerData?.name} wants to learn</p>
                      <p style={{ fontSize: '0.78rem', color: '#6B7280' }}>{s.skillData?.title}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    <button onClick={() => handleStatus(s.id, 'confirmed')} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '7px 14px', background: '#14B8A6', color: '#fff', borderRadius: '8px', border: 'none', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>
                      <Check size={14} /> Accept
                    </button>
                    <button onClick={() => handleStatus(s.id, 'cancelled')} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '7px 14px', background: 'transparent', color: '#6B7280', borderRadius: '8px', border: '1.5px solid #E5E7EB', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>
                      <X size={14} /> Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ MY SKILLS ══ */}
        {tab === 'skills' && (
          <div style={{ maxWidth: '700px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1A1A1A' }}>My Skills</h1>
              <Link to={`/profile/${user?.id}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: '#2563EB', color: '#fff', borderRadius: '8px', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none' }}>
                <Plus size={16} /> Add Skill
              </Link>
            </div>
            <div style={card}>
              {loading ? (
                <p style={{ textAlign: 'center', color: '#9CA3AF', padding: '2rem' }}>Loading...</p>
              ) : mySkills.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 0', color: '#9CA3AF' }}>
                  <GraduationCap size={40} style={{ marginBottom: '1rem', opacity: 0.4 }} />
                  <p style={{ fontWeight: 500, color: '#6B7280', marginBottom: '0.5rem' }}>No skills listed yet</p>
                  <Link to={`/profile/${user?.id}`} style={{ display: 'inline-block', marginTop: '0.5rem', padding: '9px 20px', background: '#2563EB', color: '#fff', borderRadius: '8px', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none' }}>
                    Go to Profile
                  </Link>
                </div>
              ) : mySkills.map((skill, i) => (
                <div key={skill.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: i < mySkills.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                  <div>
                    <p style={{ fontWeight: 600, color: '#1A1A1A', marginBottom: '4px' }}>{skill.title}</p>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <span style={{ padding: '2px 8px', background: '#F3F4F6', borderRadius: '4px', fontSize: '0.72rem', color: '#6B7280' }}>{skill.category}</span>
                      <span style={{ padding: '2px 8px', background: '#EFF6FF', borderRadius: '4px', fontSize: '0.72rem', color: '#2563EB', textTransform: 'capitalize' }}>{skill.level}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ MESSAGES ══ */}
        {tab === 'messages' && (
          <div style={{ maxWidth: '700px' }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1A1A1A', marginBottom: '1.5rem' }}>Messages</h1>
            <div style={{ ...card, textAlign: 'center', padding: '4rem' }}>
              <MessageSquare size={40} color="#D1D5DB" style={{ marginBottom: '1rem' }} />
              <p style={{ fontWeight: 600, color: '#6B7280', marginBottom: '0.4rem' }}>No messages yet</p>
              <p style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>Messages with session partners will appear here</p>
            </div>
          </div>
        )}

        {/* ══ SETTINGS ══ */}
        {tab === 'settings' && (
          <div style={{ maxWidth: '600px' }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1A1A1A', marginBottom: '1.5rem' }}>Settings</h1>
            <div style={card}>
              <h3 style={{ fontWeight: 700, marginBottom: '1.25rem', color: '#1A1A1A' }}>Account Information</h3>
              {[{ label: 'Full Name', value: user?.name || '' }, { label: 'Email', value: user?.email || '' }].map(({ label, value }) => (
                <div key={label} style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '6px', color: '#1A1A1A' }}>{label}</label>
                  <input defaultValue={value} readOnly style={{ width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '0.9rem', color: '#1A1A1A', background: '#F9FAFB' }} />
                </div>
              ))}
              <Link to={`/profile/${user?.id}`} style={{ display: 'inline-block', marginTop: '0.5rem', padding: '10px 20px', background: '#2563EB', color: '#fff', borderRadius: '8px', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none' }}>
                Edit Full Profile
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
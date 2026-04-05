import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Home, GraduationCap, MessageSquare, Settings, Calendar, Clock, Check, X, Plus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

const MOCK_SESSIONS = [
  { id: '1', peerName: 'Marcus Williams', skill: 'UI/UX Design Principles', date: '2026-04-08', time: '2:00 PM', type: 'learning', status: 'accepted' },
  { id: '2', peerName: 'Emily Rodriguez', skill: 'React Advanced Patterns', date: '2026-04-10', time: '10:00 AM', type: 'teaching', status: 'accepted' },
  { id: '3', peerName: 'David Kim', skill: 'Python Data Structures', date: '2026-04-12', time: '4:00 PM', type: 'learning', status: 'pending' },
]

const NAV = [
  { id: 'overview', label: 'Overview', icon: Home },
  { id: 'skills', label: 'My Skills', icon: GraduationCap },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'settings', label: 'Settings', icon: Settings },
]

const card = { background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }

export default function Dashboard() {
  const { user } = useAuth()
  const [tab, setTab] = useState('overview')
  const [sessions, setSessions] = useState([])
  const [mySkills, setMySkills] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/sessions/me').catch(() => ({ data: [] })),
      api.get('/skills').catch(() => ({ data: [] })),
    ]).then(([sessRes, skillRes]) => {
      setSessions(sessRes.data.length > 0 ? sessRes.data : MOCK_SESSIONS)
      setMySkills(skillRes.data.filter(s => s.userId === user?.id))
      setLoading(false)
    })
  }, [user])

  const upcoming = sessions.filter(s => s.status === 'accepted' || s.status === 'pending')
  const pending = sessions.filter(s => s.status === 'pending')

  const handleStatus = async (id, status) => {
    try {
      await api.put(`/sessions/${id}`, { status })
      setSessions(prev => prev.map(s => s.id === id ? { ...s, status } : s))
    } catch { /* ignore */ }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAFBFC', display: 'flex' }}>

      {/* Sidebar */}
      <aside style={{ width: '240px', background: '#fff', borderRight: '1px solid #E5E7EB', minHeight: '100vh', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.5rem 1rem' }}>
          {/* User info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: '#F3F4F6', borderRadius: '12px', marginBottom: '1.5rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563EB, #14B8A6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              {user?.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1A1A1A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'User'}</p>
              <p style={{ fontSize: '0.75rem', color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email || ''}</p>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {NAV.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setTab(id)} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 14px', borderRadius: '10px', cursor: 'pointer',
                background: tab === id ? '#2563EB' : 'transparent',
                color: tab === id ? '#fff' : '#6B7280',
                border: 'none', fontWeight: tab === id ? 600 : 500,
                fontSize: '0.9rem', transition: 'all 0.15s', textAlign: 'left',
              }}>
                <Icon size={18} />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>

        {/* ── Overview ── */}
        {tab === 'overview' && (
          <div style={{ maxWidth: '900px' }}>
            <div style={{ marginBottom: '2rem' }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1A1A1A', letterSpacing: '-0.02em', marginBottom: '4px' }}>
                Welcome back, {user?.name?.split(' ')[0] || 'there'}!
              </h1>
              <p style={{ color: '#6B7280', fontSize: '0.95rem' }}>Here's what's happening with your learning journey</p>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              {[
                { label: 'Hours Taught', value: 24, note: '+4 this month', icon: GraduationCap, color: '#2563EB' },
                { label: 'Hours Learned', value: 18, note: '+3 this month', icon: Clock, color: '#14B8A6' },
              ].map(({ label, value, note, icon: Icon, color }) => (
                <div key={label} style={card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#6B7280' }}>{label}</span>
                    <div style={{ width: '44px', height: '44px', background: `${color}15`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={20} color={color} />
                    </div>
                  </div>
                  <p style={{ fontSize: '2rem', fontWeight: 800, color: '#1A1A1A', letterSpacing: '-0.02em' }}>{value}</p>
                  <p style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '4px' }}>{note}</p>
                </div>
              ))}
            </div>

            {/* Upcoming Sessions */}
            <div style={{ ...card, marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1A1A1A' }}>Upcoming Sessions</h3>
                <Link to="/browse" style={{ padding: '7px 14px', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, color: '#6B7280' }}>
                  + Book New
                </Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {upcoming.length === 0 ? (
                  <p style={{ color: '#9CA3AF', fontSize: '0.9rem', textAlign: 'center', padding: '2rem 0' }}>No upcoming sessions. <Link to="/browse" style={{ color: '#2563EB' }}>Browse skills</Link></p>
                ) : upcoming.map(s => (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: '#F9FAFB', borderRadius: '10px', border: '1px solid #F3F4F6' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563EB22, #14B8A622)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: 700, color: '#2563EB', flexShrink: 0 }}>
                      {(s.peerName || s.teacher?.name || s.learner?.name || '?')[0]}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1A1A1A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.skill?.title || s.skill}</p>
                      <p style={{ fontSize: '0.78rem', color: '#6B7280' }}>with {s.peerName || s.teacher?.name || s.learner?.name}</p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', color: '#6B7280', marginBottom: '2px' }}>
                        <Calendar size={13} /> {s.date}
                      </div>
                      <p style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{s.time}</p>
                    </div>
                    <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 600, background: s.type === 'teaching' ? '#EFF6FF' : '#F0FDFA', color: s.type === 'teaching' ? '#2563EB' : '#14B8A6', flexShrink: 0 }}>
                      {s.type === 'teaching' ? 'Teaching' : 'Learning'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Requests */}
            <div style={card}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1A1A1A', marginBottom: '1rem' }}>Pending Requests</h3>
              {pending.length === 0 ? (
                <p style={{ color: '#9CA3AF', fontSize: '0.9rem', textAlign: 'center', padding: '1rem 0' }}>No pending requests</p>
              ) : pending.map(s => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '12px 14px', background: '#FFFBEB', borderRadius: '10px', border: '1px solid #FDE68A' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#D97706', flexShrink: 0 }}>
                      {(s.peerName || s.learner?.name || '?')[0]}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1A1A1A' }}>{s.peerName || s.learner?.name} wants to learn</p>
                      <p style={{ fontSize: '0.78rem', color: '#6B7280' }}>{s.skill?.title || s.skill}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    <button onClick={() => handleStatus(s.id, 'accepted')} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '7px 14px', background: '#14B8A6', color: '#fff', borderRadius: '8px', border: 'none', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>
                      <Check size={14} /> Accept
                    </button>
                    <button onClick={() => handleStatus(s.id, 'declined')} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '7px 14px', background: 'transparent', color: '#6B7280', borderRadius: '8px', border: '1.5px solid #E5E7EB', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>
                      <X size={14} /> Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── My Skills ── */}
        {tab === 'skills' && (
          <div style={{ maxWidth: '700px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1A1A1A', letterSpacing: '-0.02em' }}>My Skills</h1>
              <Link to={`/profile/${user?.id}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: '#2563EB', color: '#fff', borderRadius: '8px', fontWeight: 600, fontSize: '0.875rem' }}>
                <Plus size={16} /> Add Skill
              </Link>
            </div>
            <div style={card}>
              {mySkills.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 0', color: '#9CA3AF' }}>
                  <GraduationCap size={40} style={{ marginBottom: '1rem', opacity: 0.4 }} />
                  <p style={{ fontWeight: 500, marginBottom: '0.5rem' }}>No skills listed yet</p>
                  <p style={{ fontSize: '0.875rem' }}>Go to your profile to add skills you can teach</p>
                </div>
              ) : mySkills.map((skill, i) => (
                <div key={skill.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: i < mySkills.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                  <div>
                    <p style={{ fontWeight: 600, color: '#1A1A1A', marginBottom: '4px' }}>{skill.title}</p>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <span style={{ padding: '2px 8px', background: '#F3F4F6', borderRadius: '4px', fontSize: '0.72rem', color: '#6B7280' }}>{skill.category}</span>
                      <span style={{ padding: '2px 8px', background: '#EFF6FF', borderRadius: '4px', fontSize: '0.72rem', color: '#2563EB' }}>{skill.level}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Messages ── */}
        {tab === 'messages' && (
          <div style={{ maxWidth: '700px' }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1A1A1A', letterSpacing: '-0.02em', marginBottom: '1.5rem' }}>Messages</h1>
            <div style={{ ...card, textAlign: 'center', padding: '4rem' }}>
              <MessageSquare size={40} color="#D1D5DB" style={{ marginBottom: '1rem' }} />
              <p style={{ fontWeight: 600, color: '#6B7280', marginBottom: '0.4rem' }}>No messages yet</p>
              <p style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>Messages with your session partners will appear here</p>
            </div>
          </div>
        )}

        {/* ── Settings ── */}
        {tab === 'settings' && (
          <div style={{ maxWidth: '600px' }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1A1A1A', letterSpacing: '-0.02em', marginBottom: '1.5rem' }}>Settings</h1>
            <div style={card}>
              <h3 style={{ fontWeight: 700, marginBottom: '1.25rem', color: '#1A1A1A' }}>Account</h3>
              {[
                { label: 'Full Name', value: user?.name || '' },
                { label: 'Email', value: user?.email || '' },
              ].map(({ label, value }) => (
                <div key={label} style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '6px', color: '#1A1A1A' }}>{label}</label>
                  <input defaultValue={value} style={{ width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '0.9rem', color: '#1A1A1A', background: '#F9FAFB' }} readOnly />
                </div>
              ))}
              <Link to={`/profile/${user?.id}`} style={{ display: 'inline-block', marginTop: '0.5rem', padding: '10px 20px', background: '#2563EB', color: '#fff', borderRadius: '8px', fontWeight: 600, fontSize: '0.875rem' }}>
                Edit Full Profile
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
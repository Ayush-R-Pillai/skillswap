import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Star, MapPin, Calendar, Plus, Trash2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

const LEVEL_COLORS = { Beginner: '#14B8A6', Intermediate: '#2563EB', Advanced: '#8B5CF6' }
const CATEGORIES = ['Technology', 'Design', 'Music', 'Language', 'Business', 'Other']
const LEVELS = ['Beginner', 'Intermediate', 'Advanced']

function Stars({ rating = 5 }) {
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={14} fill={i <= rating ? '#FBBF24' : 'none'} color={i <= rating ? '#FBBF24' : '#D1D5DB'} />
      ))}
    </div>
  )
}

export default function Profile() {
  const { id } = useParams()
  const { user: authUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [skills, setSkills] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [bio, setBio] = useState('')
  const [name, setName] = useState('')
  const [showAddSkill, setShowAddSkill] = useState(false)
  const [newSkill, setNewSkill] = useState({ title: '', description: '', category: 'Technology', level: 'Beginner' })

  const isOwn = authUser?.id === id

  useEffect(() => {
    Promise.all([
      api.get(`/users/${id}`),
      api.get('/skills'),
      api.get(`/reviews/${id}`).catch(() => ({ data: [] })),
    ]).then(([userRes, skillsRes, reviewsRes]) => {
      setProfile(userRes.data)
      setBio(userRes.data.bio || '')
      setName(userRes.data.name || '')
      setSkills(skillsRes.data.filter(s => s.userId === id))
      setReviews(reviewsRes.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [id])

  const saveProfile = async () => {
    try {
      const res = await api.put('/users/me', { name, bio })
      setProfile(res.data)
      setEditing(false)
    } catch { /* ignore */ }
  }

  const addSkill = async () => {
    if (!newSkill.title) return
    try {
      const res = await api.post('/skills', newSkill)
      setSkills(prev => [...prev, res.data])
      setNewSkill({ title: '', description: '', category: 'Technology', level: 'Beginner' })
      setShowAddSkill(false)
    } catch { /* ignore */ }
  }

  const deleteSkill = async (skillId) => {
    try {
      await api.delete(`/skills/${skillId}`)
      setSkills(prev => prev.filter(s => s.id !== skillId))
    } catch { /* ignore */ }
  }

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>Loading...</div>
  if (!profile) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>User not found</div>

  const inputStyle = { width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '0.9rem', color: '#1A1A1A', background: '#fff', transition: 'border-color 0.15s' }
  const cardStyle = { background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }

  return (
    <div style={{ minHeight: '100vh', background: '#FAFBFC' }}>

      {/* Cover */}
      <div style={{ height: '220px', background: 'linear-gradient(135deg, #2563EB, #14B8A6)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.1) 0%, transparent 60%)' }} />
      </div>

      {/* Profile header */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ position: 'relative', marginTop: '-64px', paddingBottom: '1.5rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'flex-end' }}>
            {/* Avatar */}
            <div style={{ width: '120px', height: '120px', borderRadius: '50%', border: '4px solid #fff', background: 'linear-gradient(135deg, #2563EB, #14B8A6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 800, color: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', flexShrink: 0 }}>
              {profile.name?.[0]?.toUpperCase()}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: '200px', paddingTop: '48px' }}>
              {editing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px' }}>
                  <input value={name} onChange={e => setName(e.target.value)} style={inputStyle} placeholder="Your name"
                    onFocus={e => e.target.style.borderColor = '#2563EB'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
                  <textarea value={bio} onChange={e => setBio(e.target.value)} style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} placeholder="Tell others about yourself..."
                    onFocus={e => e.target.style.borderColor = '#2563EB'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={saveProfile} style={{ padding: '8px 18px', background: '#2563EB', color: '#fff', borderRadius: '8px', border: 'none', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>Save</button>
                    <button onClick={() => setEditing(false)} style={{ padding: '8px 18px', background: 'transparent', color: '#6B7280', borderRadius: '8px', border: '1.5px solid #E5E7EB', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1A1A1A', letterSpacing: '-0.02em', marginBottom: '6px' }}>{profile.name}</h1>
                  <p style={{ color: '#6B7280', fontSize: '0.9rem', marginBottom: '12px', maxWidth: '500px', lineHeight: 1.5 }}>{profile.bio || 'No bio yet.'}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '0.82rem', color: '#9CA3AF' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> Joined recently</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={14} /> Active member</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Star size={14} fill="#FBBF24" color="#FBBF24" /> 4.9 avg rating</span>
                  </div>
                </>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px', paddingTop: '48px' }}>
              {isOwn ? (
                <button onClick={() => setEditing(true)} style={{ padding: '10px 20px', border: '1.5px solid #E5E7EB', borderRadius: '10px', background: '#fff', color: '#1A1A1A', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>
                  Edit Profile
                </button>
              ) : (
                <Link to={`/session/request/${id}`} style={{ padding: '10px 24px', background: '#14B8A6', color: '#fff', borderRadius: '10px', fontWeight: 700, fontSize: '0.95rem', boxShadow: '0 4px 12px #14B8A630' }}>
                  Book a Session
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Content grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', paddingBottom: '3rem' }}>

          {/* Left col */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Skills */}
            <div style={cardStyle}>
              <div style={{ padding: '1.25rem', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#1A1A1A' }}>Offered Skills</h3>
                {isOwn && (
                  <button onClick={() => setShowAddSkill(!showAddSkill)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', background: '#EFF6FF', color: '#2563EB', borderRadius: '6px', border: 'none', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer' }}>
                    <Plus size={13} /> Add
                  </button>
                )}
              </div>

              {showAddSkill && (
                <div style={{ padding: '1rem', borderBottom: '1px solid #F3F4F6', background: '#F9FAFB', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input value={newSkill.title} onChange={e => setNewSkill(p => ({ ...p, title: e.target.value }))} placeholder="Skill title" style={{ ...inputStyle, padding: '8px 12px', fontSize: '0.85rem' }} />
                  <input value={newSkill.description} onChange={e => setNewSkill(p => ({ ...p, description: e.target.value }))} placeholder="Description (optional)" style={{ ...inputStyle, padding: '8px 12px', fontSize: '0.85rem' }} />
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <select value={newSkill.category} onChange={e => setNewSkill(p => ({ ...p, category: e.target.value }))} style={{ flex: 1, padding: '8px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '0.82rem' }}>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                    <select value={newSkill.level} onChange={e => setNewSkill(p => ({ ...p, level: e.target.value }))} style={{ flex: 1, padding: '8px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '0.82rem' }}>
                      {LEVELS.map(l => <option key={l}>{l}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={addSkill} style={{ flex: 1, padding: '8px', background: '#2563EB', color: '#fff', borderRadius: '8px', border: 'none', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}>Add Skill</button>
                    <button onClick={() => setShowAddSkill(false)} style={{ flex: 1, padding: '8px', background: 'transparent', color: '#6B7280', borderRadius: '8px', border: '1.5px solid #E5E7EB', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}>Cancel</button>
                  </div>
                </div>
              )}

              <div style={{ padding: '0.75rem 1.25rem' }}>
                {skills.length === 0 ? (
                  <p style={{ color: '#9CA3AF', fontSize: '0.875rem', textAlign: 'center', padding: '1.5rem 0' }}>No skills listed yet</p>
                ) : skills.map((skill, i) => (
                  <div key={skill.id} style={{ padding: '12px 0', borderBottom: i < skills.length - 1 ? '1px solid #F3F4F6' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1A1A1A', marginBottom: '6px' }}>{skill.title}</p>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <span style={{ padding: '2px 8px', background: '#F3F4F6', borderRadius: '4px', fontSize: '0.72rem', color: '#6B7280' }}>{skill.category}</span>
                        <span style={{ padding: '2px 8px', background: `${LEVEL_COLORS[skill.level]}15`, borderRadius: '4px', fontSize: '0.72rem', color: LEVEL_COLORS[skill.level] }}>{skill.level}</span>
                      </div>
                    </div>
                    {isOwn && (
                      <button onClick={() => deleteSkill(skill.id)} style={{ background: 'none', border: 'none', color: '#D1D5DB', cursor: 'pointer', padding: '2px' }}>
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div style={cardStyle}>
              <div style={{ padding: '1.25rem' }}>
                <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#1A1A1A', marginBottom: '1rem' }}>Stats</h3>
                {[
                  { label: 'Total Sessions', value: '42' },
                  { label: 'Response Time', value: '2 hours' },
                  { label: 'Completion Rate', value: '98%' },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F9FAFB' }}>
                    <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>{label}</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1A1A1A' }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right col - Reviews */}
          <div style={cardStyle}>
            <div style={{ padding: '1.25rem', borderBottom: '1px solid #F3F4F6' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#1A1A1A' }}>Reviews ({reviews.length})</h3>
            </div>
            <div style={{ padding: '1.25rem' }}>
              {reviews.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 0', color: '#9CA3AF' }}>
                  <Star size={36} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                  <p style={{ fontWeight: 500, marginBottom: '4px' }}>No reviews yet</p>
                  <p style={{ fontSize: '0.875rem' }}>Reviews from completed sessions will appear here</p>
                </div>
              ) : reviews.map((review, i) => (
                <div key={review.id} style={{ display: 'flex', gap: '14px', padding: '1.25rem 0', borderBottom: i < reviews.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #EFF6FF, #F0FDFA)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#2563EB', flexShrink: 0 }}>
                    {(review.reviewer?.name || 'A')[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1A1A1A' }}>{review.reviewer?.name || 'Anonymous'}</p>
                        <p style={{ fontSize: '0.78rem', color: '#9CA3AF' }}>{new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      </div>
                      <Stars rating={review.rating} />
                    </div>
                    <p style={{ color: '#6B7280', fontSize: '0.875rem', lineHeight: 1.5 }}>{review.comment}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
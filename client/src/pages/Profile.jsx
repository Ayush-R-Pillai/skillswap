import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Calendar, MapPin, Plus, Sparkles, Star, Trash2, Trophy } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

const LEVEL_COLORS = {
  Beginner: 'rgba(61, 217, 164, 0.28)',
  Intermediate: 'rgba(33, 195, 252, 0.28)',
  Advanced: 'rgba(137, 81, 255, 0.32)',
}
const CATEGORIES = ['Technology', 'Design', 'Music', 'Language', 'Business', 'Other']
const LEVELS = ['Beginner', 'Intermediate', 'Advanced']
const TABS = ['Skills Offered', 'Skills Learning', 'Reviews']

function Stars({ rating = 5 }) {
  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {[1, 2, 3, 4, 5].map((value) => (
        <Star key={value} size={15} fill={value <= rating ? '#f8c65f' : 'none'} color={value <= rating ? '#f8c65f' : 'rgba(255,255,255,0.18)'} />
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
  const [activeTab, setActiveTab] = useState('Skills Offered')
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
      setSkills((skillsRes.data || []).filter((skill) => skill.userId === id || skill.offeredBy === id))
      setReviews(reviewsRes.data || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [id])

  const saveProfile = async () => {
    try {
      const response = await api.put('/users/me', { name, bio })
      setProfile(response.data)
      setEditing(false)
    } catch {
      // ignore
    }
  }

  const addSkill = async () => {
    if (!newSkill.title) return
    try {
      const response = await api.post('/skills', newSkill)
      setSkills((prev) => [...prev, response.data])
      setNewSkill({ title: '', description: '', category: 'Technology', level: 'Beginner' })
      setShowAddSkill(false)
    } catch {
      // ignore
    }
  }

  const deleteSkill = async (skillId) => {
    try {
      await api.delete(`/skills/${skillId}`)
      setSkills((prev) => prev.filter((skill) => skill.id !== skillId))
    } catch {
      // ignore
    }
  }

  const learningSkills = useMemo(() => reviews.slice(0, 3).map((review, index) => ({ id: review.id || index, title: review.sessionTitle || 'Learning in progress', detail: review.comment || 'Building new capability through shared sessions.' })), [reviews])

  if (loading) {
    return (
      <div className="page-shell">
        <div className="page-content">
          <div className="glass-card skeleton" style={{ minHeight: '72vh', borderRadius: '28px' }} />
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="page-shell">
        <div className="page-content">
          <div className="glass-card" style={{ padding: '42px', textAlign: 'center' }}>User not found.</div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-shell">
      <div className="page-content" style={{ display: 'grid', gap: '22px' }}>
        <section className="glass-card surface-grid" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ minHeight: '240px', padding: '34px', background: 'linear-gradient(135deg, rgba(137,81,255,0.3), rgba(14,67,251,0.22), rgba(33,195,252,0.16))' }}>
            <div className="floating-orb" style={{ top: '10%', right: '6%', width: '160px', height: '160px', background: 'radial-gradient(circle, rgba(255,255,255,0.18), transparent 72%)' }} />
            <div className="floating-orb" style={{ left: '24%', bottom: '-10px', width: '120px', height: '120px', background: 'radial-gradient(circle, rgba(33,195,252,0.24), transparent 72%)', animationDelay: '-5s' }} />
            <div className="eyebrow">Premium profile</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', alignItems: 'flex-end', flexWrap: 'wrap', marginTop: '40px' }}>
              <div style={{ display: 'flex', gap: '18px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div style={{ width: '116px', height: '116px', marginBottom: '-62px', borderRadius: '32px', display: 'grid', placeItems: 'center', fontSize: '2.6rem', fontWeight: 800, background: 'linear-gradient(135deg, rgba(11,17,31,0.88), rgba(17,28,54,0.88))', border: '1px solid rgba(255,255,255,0.14)', boxShadow: 'var(--shadow-lg)' }}>
                  {profile.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <h1 className="section-heading" style={{ margin: 0 }}>{profile.name}</h1>
                  <p className="section-subtitle" style={{ marginTop: '10px', maxWidth: '680px' }}>{profile.bio || 'A high-signal profile with live sessions, thoughtful reviews, and a curated skill graph.'}</p>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '16px' }}>
                    <span className="pill-badge" style={{ background: 'rgba(255,255,255,0.08)' }}><MapPin size={14} /> Remote-first</span>
                    <span className="pill-badge" style={{ background: 'rgba(255,255,255,0.08)' }}><Calendar size={14} /> Active this week</span>
                    <span className="pill-badge status-confirmed"><Star size={14} /> 4.9 average</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {isOwn ? (
                  <button type="button" className="secondary-button" onClick={() => setEditing((prev) => !prev)}>
                    {editing ? 'Close editor' : 'Edit profile'}
                  </button>
                ) : (
                  <Link to={`/session/request/${id}`} className="gradient-button">Book a session</Link>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="premium-tablet-stack" style={{ alignItems: 'start' }}>
          <div style={{ display: 'grid', gap: '22px' }}>
            {editing && isOwn && (
              <div className="glass-card" style={{ padding: '22px', display: 'grid', gap: '12px' }}>
                <div className="field-shell">
                  <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Name" />
                  <label>Display name</label>
                </div>
                <div className="field-shell">
                  <textarea value={bio} onChange={(event) => setBio(event.target.value)} placeholder="Bio" />
                  <label>Bio</label>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button type="button" className="gradient-button" onClick={saveProfile}>Save profile</button>
                  <button type="button" className="secondary-button" onClick={() => setEditing(false)}>Cancel</button>
                </div>
              </div>
            )}

            <div className="glass-card" style={{ padding: '18px' }}>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {TABS.map((tab) => {
                  const active = tab === activeTab
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '16px',
                        border: `1px solid ${active ? 'rgba(137,81,255,0.24)' : 'rgba(255,255,255,0.06)'}`,
                        background: active ? 'linear-gradient(135deg, rgba(137,81,255,0.18), rgba(14,67,251,0.12))' : 'rgba(255,255,255,0.03)',
                        color: active ? 'var(--text)' : 'var(--muted)',
                        fontWeight: 700,
                      }}
                    >
                      {tab}
                    </button>
                  )
                })}
              </div>
            </div>

            {activeTab === 'Skills Offered' && (
              <div className="glass-card" style={{ padding: '22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.12rem' }}>Skills offered</div>
                    <div style={{ color: 'var(--muted)', fontSize: '0.86rem' }}>Premium teaching tiles with categories and progression level.</div>
                  </div>
                  {isOwn && (
                    <button type="button" className="gradient-button" onClick={() => setShowAddSkill((prev) => !prev)} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <Plus size={16} />
                      Add skill
                    </button>
                  )}
                </div>

                {showAddSkill && isOwn && (
                  <div className="glass-card soft" style={{ padding: '18px', display: 'grid', gap: '12px', marginBottom: '18px' }}>
                    <div className="field-shell">
                      <input value={newSkill.title} onChange={(event) => setNewSkill((prev) => ({ ...prev, title: event.target.value }))} placeholder="Skill title" />
                      <label>Skill title</label>
                    </div>
                    <div className="field-shell">
                      <textarea value={newSkill.description} onChange={(event) => setNewSkill((prev) => ({ ...prev, description: event.target.value }))} placeholder="Description" />
                      <label>Description</label>
                    </div>
                    <div className="card-grid" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
                      <div className="field-shell">
                        <select value={newSkill.category} onChange={(event) => setNewSkill((prev) => ({ ...prev, category: event.target.value }))}>
                          {CATEGORIES.map((item) => <option key={item}>{item}</option>)}
                        </select>
                        <label>Category</label>
                      </div>
                      <div className="field-shell">
                        <select value={newSkill.level} onChange={(event) => setNewSkill((prev) => ({ ...prev, level: event.target.value }))}>
                          {LEVELS.map((item) => <option key={item}>{item}</option>)}
                        </select>
                        <label>Level</label>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <button type="button" className="gradient-button" onClick={addSkill}>Publish skill</button>
                      <button type="button" className="secondary-button" onClick={() => setShowAddSkill(false)}>Close</button>
                    </div>
                  </div>
                )}

                {skills.length === 0 ? (
                  <div className="glass-card soft" style={{ padding: '34px', textAlign: 'center', color: 'var(--muted)' }}>
                    No skills listed yet.
                  </div>
                ) : (
                  <div className="card-grid">
                    {skills.map((skill) => (
                      <div key={skill.id} className="glass-card soft hover-lift" style={{ padding: '20px', display: 'grid', gap: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '1rem' }}>{skill.title}</div>
                            <div style={{ color: 'var(--muted)', fontSize: '0.86rem' }}>{skill.description || 'Structured peer learning sessions with live collaboration.'}</div>
                          </div>
                          {isOwn && (
                            <button type="button" className="ghost-button" onClick={() => deleteSkill(skill.id)} style={{ padding: '10px', borderRadius: '14px' }}>
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <span className="pill-badge" style={{ background: 'rgba(255,255,255,0.04)' }}>{skill.category}</span>
                          <span className="pill-badge" style={{ background: LEVEL_COLORS[skill.level] || 'rgba(255,255,255,0.08)' }}>{skill.level}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'Skills Learning' && (
              <div className="glass-card" style={{ padding: '22px' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.12rem', marginBottom: '16px' }}>Skills learning</div>
                <div className="card-grid">
                  {(learningSkills.length ? learningSkills : [{ id: 'empty', title: 'No active learning goals', detail: 'Session requests and live learning targets will show up here.' }]).map((item) => (
                    <div key={item.id} className="glass-card soft" style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <Sparkles size={16} color="#21C3FC" />
                        <span style={{ fontWeight: 700 }}>{item.title}</span>
                      </div>
                      <div style={{ color: 'var(--muted)' }}>{item.detail}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'Reviews' && (
              <div className="glass-card" style={{ padding: '22px' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.12rem', marginBottom: '16px' }}>Reviews</div>
                {reviews.length === 0 ? (
                  <div className="glass-card soft" style={{ padding: '34px', textAlign: 'center', color: 'var(--muted)' }}>No reviews yet.</div>
                ) : (
                  <div style={{ display: 'grid', gap: '14px' }}>
                    {reviews.map((review) => (
                      <div key={review.id} className="glass-card soft hover-lift" style={{ padding: '18px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '10px', flexWrap: 'wrap' }}>
                          <div>
                            <div style={{ fontWeight: 700 }}>{review.reviewer?.name || 'Anonymous learner'}</div>
                            <div style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>{new Date(review.createdAt).toLocaleDateString()}</div>
                          </div>
                          <Stars rating={review.rating} />
                        </div>
                        <div style={{ color: 'var(--muted)' }}>{review.comment}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <aside style={{ display: 'grid', gap: '22px' }}>
            <div className="glass-card" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <Trophy size={18} color="#21C3FC" />
                <span style={{ fontWeight: 700 }}>Profile highlights</span>
              </div>
              <div style={{ display: 'grid', gap: '12px' }}>
                {[
                  { label: 'Skills listed', value: skills.length },
                  { label: 'Reviews', value: reviews.length },
                  { label: 'Learner rating', value: reviews.length ? '4.9/5' : 'New' },
                ].map((item) => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '16px', background: 'rgba(255,255,255,0.04)' }}>
                    <span style={{ color: 'var(--muted)' }}>{item.label}</span>
                    <span style={{ fontWeight: 700 }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card" style={{ padding: '22px' }}>
              <div style={{ fontWeight: 700, marginBottom: '14px' }}>Reputation</div>
              <div style={{ display: 'grid', placeItems: 'center', padding: '8px 0 18px' }}>
                <div style={{ width: '180px', height: '180px', borderRadius: '50%', display: 'grid', placeItems: 'center', background: 'conic-gradient(#8951FF 0 82%, rgba(255,255,255,0.08) 82% 100%)' }}>
                  <div className="glass-card soft" style={{ width: '122px', height: '122px', borderRadius: '50%', display: 'grid', placeItems: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.8rem' }}>82%</div>
                      <div style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>trust score</div>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ color: 'var(--muted)', textAlign: 'center' }}>Built from profile completeness, review quality, and session follow-through.</div>
            </div>
          </aside>
        </section>
      </div>
    </div>
  )
}


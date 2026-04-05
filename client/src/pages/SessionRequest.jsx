import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Calendar, CheckCircle2, ChevronLeft, ChevronRight, Clock3, Sparkles } from 'lucide-react'
import api from '../api/axios'

const TIME_SLOTS = [
  '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM',
  '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM',
]

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function CalendarPicker({ selected, onSelect }) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const [view, setView] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const year = view.getFullYear()
  const month = view.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const prevDays = new Date(year, month, 0).getDate()

  const cells = []
  for (let index = firstDay - 1; index >= 0; index -= 1) cells.push({ day: prevDays - index, type: 'prev' })
  for (let day = 1; day <= daysInMonth; day += 1) cells.push({ day, type: 'cur' })
  while (cells.length < 42) cells.push({ day: cells.length - firstDay - daysInMonth + 1, type: 'next' })

  return (
    <div className="glass-card" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <button type="button" className="ghost-button" onClick={() => setView(new Date(year, month - 1, 1))} style={{ padding: '10px', borderRadius: '14px' }}>
          <ChevronLeft size={16} />
        </button>
        <div style={{ fontWeight: 700 }}>{MONTHS[month]} {year}</div>
        <button type="button" className="ghost-button" onClick={() => setView(new Date(year, month + 1, 1))} style={{ padding: '10px', borderRadius: '14px' }}>
          <ChevronRight size={16} />
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '8px' }}>
        {DAYS.map((day) => <div key={day} style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '0.78rem', fontWeight: 700 }}>{day}</div>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
        {cells.map((cell, index) => {
          const date = new Date(cell.type === 'prev' ? year : year, cell.type === 'prev' ? month - 1 : cell.type === 'next' ? month + 1 : month, cell.day)
          const isOther = cell.type !== 'cur'
          const isPast = date < today
          const isSelected = selected && date.toDateString() === selected.toDateString()
          return (
            <button
              key={`${cell.day}-${index}`}
              type="button"
              disabled={isOther || isPast}
              onClick={() => onSelect(date)}
              style={{
                aspectRatio: '1 / 1',
                borderRadius: '18px',
                border: `1px solid ${isSelected ? 'rgba(137,81,255,0.34)' : 'rgba(255,255,255,0.05)'}`,
                background: isSelected ? 'linear-gradient(135deg, rgba(137,81,255,0.32), rgba(14,67,251,0.22))' : 'rgba(255,255,255,0.03)',
                color: isOther || isPast ? 'rgba(255,255,255,0.25)' : 'var(--text)',
                fontWeight: isSelected ? 800 : 600,
                cursor: isOther || isPast ? 'not-allowed' : 'pointer',
              }}
            >
              {cell.day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function SessionRequest() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [teacher, setTeacher] = useState(null)
  const [teacherSkills, setTeacherSkills] = useState([])
  const [selectedSkill, setSelectedSkill] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    Promise.all([api.get(`/users/${id}`), api.get('/skills')]).then(([userRes, skillsRes]) => {
      setTeacher(userRes.data)
      const teacherSkillSet = (skillsRes.data || []).filter((skill) => skill.userId === id || skill.offeredBy === id)
      setTeacherSkills(teacherSkillSet)
      if (teacherSkillSet.length > 0) setSelectedSkill(teacherSkillSet[0])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [id])

  const canSubmit = Boolean(selectedDate && selectedTime && message.trim() && selectedSkill)

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    try {
      await api.post('/sessions', {
        teacherId: id,
        skillId: selectedSkill.id,
        date: selectedDate.toISOString().split('T')[0],
        time: selectedTime,
        notes: message,
      })
      alert('Session request sent successfully.')
      navigate('/dashboard')
    } catch {
      alert('Failed to send request. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="page-shell">
        <div className="page-content">
          <div className="glass-card skeleton" style={{ minHeight: '76vh', borderRadius: '28px' }} />
        </div>
      </div>
    )
  }

  if (!teacher) {
    return (
      <div className="page-shell">
        <div className="page-content">
          <div className="glass-card" style={{ padding: '42px', textAlign: 'center' }}>Mentor not found.</div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-shell">
      <div className="page-content" style={{ display: 'grid', gap: '22px' }}>
        <button type="button" className="ghost-button" onClick={() => navigate(-1)} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', width: 'fit-content' }}>
          <ArrowLeft size={16} />
          Back
        </button>

        <section className="premium-tablet-stack" style={{ alignItems: 'start' }}>
          <div style={{ display: 'grid', gap: '22px' }}>
            <div className="glass-card surface-grid" style={{ padding: '28px', position: 'relative', overflow: 'hidden' }}>
              <div className="floating-orb" style={{ top: '-30px', right: '10%', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(137,81,255,0.3), transparent 70%)' }} />
              <div className="eyebrow"><Sparkles size={14} /> Session request</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap', marginTop: '18px' }}>
                <div>
                  <h1 className="section-heading">Design your next learning session</h1>
                  <p className="section-subtitle">Floating labels, glow states, and premium scheduling controls built for a polished product feel.</p>
                </div>
                <div className="glass-card soft" style={{ padding: '16px', minWidth: '220px' }}>
                  <div style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>Mentor</div>
                  <div style={{ marginTop: '6px', fontWeight: 700 }}>{teacher.name}</div>
                  <div style={{ color: 'var(--muted)', fontSize: '0.84rem', marginTop: '4px' }}>{selectedSkill?.title || 'Select a skill below'}</div>
                </div>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '22px', display: 'grid', gap: '18px' }}>
              {teacherSkills.length > 1 && (
                <div>
                  <div style={{ fontWeight: 700, marginBottom: '12px' }}>Choose a focus skill</div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {teacherSkills.map((skill) => (
                      <button
                        key={skill.id}
                        type="button"
                        onClick={() => setSelectedSkill(skill)}
                        style={{
                          padding: '12px 16px',
                          borderRadius: '16px',
                          border: `1px solid ${selectedSkill?.id === skill.id ? 'rgba(137,81,255,0.26)' : 'rgba(255,255,255,0.07)'}`,
                          background: selectedSkill?.id === skill.id ? 'linear-gradient(135deg, rgba(137,81,255,0.18), rgba(14,67,251,0.12))' : 'rgba(255,255,255,0.03)',
                          color: selectedSkill?.id === skill.id ? 'var(--text)' : 'var(--muted)',
                          fontWeight: 700,
                        }}
                      >
                        {skill.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="premium-tablet-stack" style={{ gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 0.9fr)' }}>
                <CalendarPicker selected={selectedDate} onSelect={setSelectedDate} />
                <div className="glass-card" style={{ padding: '20px', display: 'grid', gap: '16px' }}>
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: '8px' }}>Select a time</div>
                    <div style={{ color: 'var(--muted)', fontSize: '0.86rem' }}>Tap a slot to build your session request.</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px' }}>
                    {TIME_SLOTS.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setSelectedTime(time)}
                        style={{
                          padding: '12px 10px',
                          borderRadius: '16px',
                          border: `1px solid ${selectedTime === time ? 'rgba(33,195,252,0.34)' : 'rgba(255,255,255,0.06)'}`,
                          background: selectedTime === time ? 'linear-gradient(135deg, rgba(33,195,252,0.18), rgba(14,67,251,0.12))' : 'rgba(255,255,255,0.03)',
                          color: selectedTime === time ? 'var(--text)' : 'var(--muted)',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                        }}
                      >
                        <Clock3 size={14} />
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="field-shell">
                <textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Session goals" />
                <label>What would you like to learn in this session?</label>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button type="button" className="gradient-button" onClick={handleSubmit} disabled={!canSubmit || submitting} style={{ opacity: !canSubmit || submitting ? 0.65 : 1 }}>
                  {submitting ? 'Sending request...' : 'Confirm request'}
                </button>
                <button type="button" className="secondary-button" onClick={() => navigate(-1)}>Cancel</button>
              </div>
            </div>
          </div>

          <aside style={{ display: 'grid', gap: '22px' }}>
            <div className="glass-card" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '18px', display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg, rgba(137,81,255,0.3), rgba(33,195,252,0.24))', fontWeight: 800 }}>
                  {teacher.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>{teacher.name}</div>
                  <div style={{ color: 'var(--muted)', fontSize: '0.84rem' }}>Peer mentor</div>
                </div>
              </div>
              {selectedSkill && (
                <div className="glass-card soft" style={{ padding: '16px' }}>
                  <div style={{ fontWeight: 700 }}>{selectedSkill.title}</div>
                  <div style={{ color: 'var(--muted)', fontSize: '0.84rem', marginTop: '4px' }}>{selectedSkill.category} · {selectedSkill.level}</div>
                </div>
              )}
            </div>

            <div className="glass-card" style={{ padding: '22px' }}>
              <div style={{ fontWeight: 700, marginBottom: '14px' }}>What happens next</div>
              <div style={{ display: 'grid', gap: '12px' }}>
                {[
                  `Your request is sent directly to ${teacher.name}.`,
                  'They review your goals and confirm a time.',
                  'You receive the session inside your dashboard flow.',
                ].map((item) => (
                  <div key={item} className="glass-card soft" style={{ padding: '14px 16px', display: 'flex', gap: '10px' }}>
                    <CheckCircle2 size={16} color="#21C3FC" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <span style={{ color: 'var(--muted)' }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card" style={{ padding: '22px' }}>
              <div style={{ fontWeight: 700, marginBottom: '14px' }}>Session summary</div>
              <div style={{ display: 'grid', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted)' }}>
                  <span>Date</span>
                  <span style={{ color: 'var(--text)' }}>{selectedDate ? selectedDate.toLocaleDateString() : 'Not selected'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted)' }}>
                  <span>Time</span>
                  <span style={{ color: 'var(--text)' }}>{selectedTime || 'Not selected'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted)' }}>
                  <span>Skill</span>
                  <span style={{ color: 'var(--text)' }}>{selectedSkill?.title || 'Not selected'}</span>
                </div>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </div>
  )
}


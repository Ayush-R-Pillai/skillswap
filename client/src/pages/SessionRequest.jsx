import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

const TIME_SLOTS = ['9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM','7:00 PM','8:00 PM']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

function MiniCalendar({ selected, onSelect }) {
  const today = new Date(); today.setHours(0,0,0,0)
  const [view, setView] = useState(new Date(today.getFullYear(), today.getMonth(), 1))

  const year = view.getFullYear(), month = view.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = Array(firstDay).fill(null).concat([...Array(daysInMonth)].map((_, i) => i + 1))

  const prev = () => setView(new Date(year, month - 1, 1))
  const next = () => setView(new Date(year, month + 1, 1))

  return (
    <div style={{ border: '2px solid #E5E7EB', borderRadius: '14px', overflow: 'hidden', display: 'inline-block', background: '#fff' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #F3F4F6' }}>
        <button onClick={prev} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: '4px', borderRadius: '6px', display: 'flex' }}><ChevronLeft size={18} /></button>
        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1A1A1A' }}>{MONTHS[month]} {year}</span>
        <button onClick={next} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: '4px', borderRadius: '6px', display: 'flex' }}><ChevronRight size={18} /></button>
      </div>
      {/* Day labels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '8px 12px 4px' }}>
        {DAYS.map(d => <div key={d} style={{ textAlign: 'center', fontSize: '0.72rem', fontWeight: 600, color: '#9CA3AF', padding: '4px 0' }}>{d}</div>)}
      </div>
      {/* Days */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '0 12px 12px', gap: '2px' }}>
        {cells.map((day, i) => {
          if (!day) return <div key={i} />
          const date = new Date(year, month, day)
          const isPast = date < today
          const isSel = selected && date.toDateString() === selected.toDateString()
          const isToday = date.toDateString() === today.toDateString()
          return (
            <button key={i} onClick={() => !isPast && onSelect(date)} disabled={isPast} style={{
              width: '36px', height: '36px', borderRadius: '8px', border: 'none', cursor: isPast ? 'not-allowed' : 'pointer',
              background: isSel ? '#2563EB' : isToday ? '#EFF6FF' : 'transparent',
              color: isSel ? '#fff' : isPast ? '#D1D5DB' : isToday ? '#2563EB' : '#1A1A1A',
              fontSize: '0.85rem', fontWeight: isSel || isToday ? 700 : 400,
              transition: 'all 0.15s',
            }}>{day}</button>
          )
        })}
      </div>
    </div>
  )
}

export default function SessionRequest() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [teacher, setTeacher] = useState(null)
  const [teacherSkills, setTeacherSkills] = useState([])
  const [selectedSkill, setSelectedSkill] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    Promise.all([
      api.get(`/users/${id}`),
      api.get('/skills'),
    ]).then(([userRes, skillsRes]) => {
      setTeacher(userRes.data)
      const ts = skillsRes.data.filter(s => s.userId === id)
      setTeacherSkills(ts)
      if (ts.length > 0) setSelectedSkill(ts[0])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [id])

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime || !message.trim() || !selectedSkill) return
    setSubmitting(true)
    try {
      await api.post('/sessions', {
        teacherId: id,
        skillId: selectedSkill.id,
        date: selectedDate.toISOString().split('T')[0],
        time: selectedTime,
        notes: message,
      })
      alert('Session request sent! The instructor will review and confirm.')
      navigate('/dashboard')
    } catch {
      alert('Failed to send request. Please try again.')
    } finally { setSubmitting(false) }
  }

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>Loading...</div>
  if (!teacher) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>User not found</div>

  const cardStyle = { background: '#fff', border: '2px solid #E5E7EB', borderRadius: '16px', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }
  const canSubmit = selectedDate && selectedTime && message.trim() && selectedSkill

  return (
    <div style={{ minHeight: '100vh', background: '#FAFBFC', padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>

        {/* Back */}
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500, marginBottom: '1.5rem', padding: 0 }}>
          <ArrowLeft size={18} /> Back
        </button>

        {/* Main card */}
        <div style={cardStyle}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1A1A1A', letterSpacing: '-0.02em', marginBottom: '1.5rem' }}>Request a Session</h1>

          {/* Instructor info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', background: '#F9FAFB', borderRadius: '12px', marginBottom: '2rem' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563EB, #14B8A6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 800, color: '#fff', flexShrink: 0 }}>
              {teacher.name?.[0]?.toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontWeight: 700, color: '#1A1A1A', marginBottom: '2px' }}>
                {selectedSkill?.title || 'Session'}
              </h3>
              <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>with {teacher.name}</p>
            </div>
            {selectedSkill && (
              <div style={{ textAlign: 'right' }}>
                <span style={{ padding: '4px 12px', background: '#F0FDFA', color: '#14B8A6', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>{selectedSkill.level}</span>
                <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '4px' }}>{selectedSkill.category}</p>
              </div>
            )}
          </div>

          {/* Skill selector */}
          {teacherSkills.length > 1 && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#1A1A1A', marginBottom: '12px' }}>Select a Skill</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {teacherSkills.map(skill => (
                  <button key={skill.id} onClick={() => setSelectedSkill(skill)} style={{
                    padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
                    border: `2px solid ${selectedSkill?.id === skill.id ? '#2563EB' : '#E5E7EB'}`,
                    background: selectedSkill?.id === skill.id ? '#EFF6FF' : '#fff',
                    color: selectedSkill?.id === skill.id ? '#2563EB' : '#6B7280',
                    transition: 'all 0.15s',
                  }}>{skill.title}</button>
                ))}
              </div>
            </div>
          )}

          {/* Date picker */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#1A1A1A', marginBottom: '1rem' }}>Select a Date</h3>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <MiniCalendar selected={selectedDate} onSelect={setSelectedDate} />
            </div>
            {selectedDate && (
              <p style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.875rem', color: '#2563EB', fontWeight: 600 }}>
                Selected: {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            )}
          </div>

          {/* Time slots */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#1A1A1A', marginBottom: '1rem' }}>Select a Time</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '8px' }}>
              {TIME_SLOTS.map(time => (
                <button key={time} onClick={() => setSelectedTime(time)} style={{
                  padding: '10px 8px', borderRadius: '10px', cursor: 'pointer', fontWeight: 500, fontSize: '0.85rem',
                  border: `2px solid ${selectedTime === time ? '#2563EB' : '#E5E7EB'}`,
                  background: selectedTime === time ? '#2563EB' : '#fff',
                  color: selectedTime === time ? '#fff' : '#6B7280',
                  transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                }}>
                  <Clock size={14} />{time}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#1A1A1A', marginBottom: '6px' }}>What do you want to learn?</h3>
            <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: '12px' }}>Give the instructor context about your goals and current level</p>
            <textarea
              value={message} onChange={e => setMessage(e.target.value)}
              placeholder="Example: I'm interested in learning React hooks and state management. I have basic JavaScript knowledge but I'm new to React..."
              style={{ width: '100%', minHeight: '120px', padding: '12px 14px', border: '2px solid #E5E7EB', borderRadius: '12px', fontSize: '0.9rem', color: '#1A1A1A', resize: 'vertical', lineHeight: 1.6, transition: 'border-color 0.15s' }}
              onFocus={e => e.target.style.borderColor = '#2563EB'} onBlur={e => e.target.style.borderColor = '#E5E7EB'}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', paddingTop: '1.5rem', borderTop: '1px solid #F3F4F6' }}>
            <button onClick={() => navigate(-1)} style={{ flex: 1, padding: '12px', border: '2px solid #E5E7EB', borderRadius: '10px', background: '#fff', color: '#6B7280', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer' }}>
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={!canSubmit || submitting} style={{
              flex: 1, padding: '12px', background: canSubmit ? '#14B8A6' : '#E5E7EB',
              color: canSubmit ? '#fff' : '#9CA3AF', border: 'none', borderRadius: '10px',
              fontWeight: 700, fontSize: '0.95rem', cursor: canSubmit ? 'pointer' : 'not-allowed',
              boxShadow: canSubmit ? '0 4px 12px #14B8A630' : 'none', transition: 'all 0.2s',
            }}>
              {submitting ? 'Sending...' : 'Confirm Request'}
            </button>
          </div>
        </div>

        {/* Info card */}
        <div style={{ marginTop: '1.25rem', background: '#EFF6FF', border: '1.5px solid #BFDBFE', borderRadius: '14px', padding: '1.25rem 1.5rem' }}>
          <h4 style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1E40AF', marginBottom: '10px' }}>What happens next?</h4>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[
              `Your request will be sent to ${teacher.name}`,
              'They\'ll review and confirm within 24 hours',
              'You\'ll receive a video call link once confirmed',
              'The session is completely free — just exchange knowledge!',
            ].map((item, i) => (
              <li key={i} style={{ fontSize: '0.85rem', color: '#3B82F6', display: 'flex', gap: '8px' }}>
                <span style={{ flexShrink: 0 }}>•</span> {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
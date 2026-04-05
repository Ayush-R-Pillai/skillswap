import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Star, X } from 'lucide-react'
import api from '../api/axios'

const CATEGORIES = ['All Categories', 'Technology', 'Design', 'Music', 'Language', 'Business', 'Other']
const LEVELS = ['All Levels', 'Beginner', 'Intermediate', 'Advanced']
const LEVEL_COLORS = { Beginner: '#14B8A6', Intermediate: '#2563EB', Advanced: '#8B5CF6' }

function SkillCard({ skill, onRequest }) {
  const [hovered, setHovered] = useState(false)
  const color = LEVEL_COLORS[skill.level] || '#2563EB'

  // Server returns offeredByUser with name, or fall back to user field
  const userName = skill.offeredByUser?.name || skill.user?.name || 'Unknown'
  const initial = userName[0]?.toUpperCase() || '?'
  const teacherId = skill.offeredBy || skill.userId

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff',
        border: `1.5px solid ${hovered ? '#2563EB30' : '#E5E7EB'}`,
        borderRadius: '16px', padding: '1.25rem',
        boxShadow: hovered ? '0 8px 32px rgba(37,99,235,0.1)' : '0 1px 4px rgba(0,0,0,0.05)',
        transition: 'all 0.2s', transform: hovered ? 'translateY(-4px)' : 'none',
        display: 'flex', flexDirection: 'column', gap: '10px',
      }}
    >
      {/* Author */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: `linear-gradient(135deg, ${color}30, ${color}60)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 700, color, flexShrink: 0 }}>
          {initial}
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1A1A1A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Star size={12} fill="#FBBF24" color="#FBBF24" />
            <span style={{ fontSize: '0.78rem', color: '#6B7280' }}>{skill.offeredByUser?.rating || '4.9'}</span>
          </div>
        </div>
      </div>

      {/* Title */}
      <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1A1A1A', lineHeight: 1.3, margin: 0 }}>
        {skill.title}
      </h4>

      {/* Description */}
      {skill.description && (
        <p style={{ fontSize: '0.82rem', color: '#6B7280', lineHeight: 1.5, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {skill.description}
        </p>
      )}

      {/* Badges */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        <span style={{ padding: '3px 10px', background: '#F3F4F6', borderRadius: '6px', fontSize: '0.72rem', color: '#6B7280', fontWeight: 500 }}>{skill.category}</span>
        <span style={{ padding: '3px 10px', background: `${color}15`, borderRadius: '6px', fontSize: '0.72rem', color, fontWeight: 500 }}>{skill.level}</span>
      </div>

      {/* CTA */}
      <button
        onClick={() => teacherId && onRequest(teacherId)}
        disabled={!teacherId}
        style={{
          marginTop: 'auto', padding: '9px', borderRadius: '8px',
          background: hovered ? '#14B8A6' : 'transparent',
          border: `1.5px solid ${hovered ? '#14B8A6' : '#E5E7EB'}`,
          color: hovered ? '#fff' : '#6B7280',
          fontWeight: 600, fontSize: '0.875rem', transition: 'all 0.2s', cursor: 'pointer',
        }}
      >Request Session →</button>
    </div>
  )
}

export default function Browse() {
  const navigate = useNavigate()
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All Categories')
  const [level, setLevel] = useState('All Levels')

  useEffect(() => {
    api.get('/skills').then(r => { setSkills(r.data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const filtered = skills.filter(s => {
    const q = search.toLowerCase()
    const userName = s.offeredByUser?.name || s.user?.name || ''
    return (
      (!search || s.title?.toLowerCase().includes(q) || (s.description || '').toLowerCase().includes(q) || userName.toLowerCase().includes(q)) &&
      (category === 'All Categories' || s.category === category) &&
      (level === 'All Levels' || s.level === level)
    )
  })

  const hasFilters = search || category !== 'All Categories' || level !== 'All Levels'
  const clearFilters = () => { setSearch(''); setCategory('All Categories'); setLevel('All Levels') }

  return (
    <div style={{ minHeight: '100vh', background: '#FAFBFC' }}>

      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E5E7EB', padding: '2.5rem 1.5rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 800, color: '#1A1A1A', letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>Browse Skills</h1>
          <p style={{ color: '#6B7280', fontSize: '0.95rem' }}>Discover talented individuals ready to share their expertise</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E5E7EB', padding: '1.25rem 1.5rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flexGrow: 1, minWidth: '200px' }}>
            <Search size={18} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search skills or people..."
              style={{ width: '100%', padding: '10px 14px 10px 40px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '0.9rem', color: '#1A1A1A', background: '#fff', transition: 'border-color 0.15s' }}
              onFocus={e => e.target.style.borderColor = '#2563EB'}
              onBlur={e => e.target.style.borderColor = '#E5E7EB'}
            />
          </div>
          <select value={category} onChange={e => setCategory(e.target.value)} style={{ padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '0.875rem', color: '#1A1A1A', background: '#fff', cursor: 'pointer', minWidth: '160px' }}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={level} onChange={e => setLevel(e.target.value)} style={{ padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '0.875rem', color: '#1A1A1A', background: '#fff', cursor: 'pointer', minWidth: '140px' }}>
            {LEVELS.map(l => <option key={l}>{l}</option>)}
          </select>
          {hasFilters && (
            <button onClick={clearFilters} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', border: '2px solid #E5E7EB', borderRadius: '10px', background: 'transparent', color: '#6B7280', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}>
              <X size={15} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem' }}>
        <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: '1.25rem', fontWeight: 500 }}>
          {loading ? 'Loading...' : `${filtered.length} ${filtered.length === 1 ? 'result' : 'results'} found`}
        </p>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {[...Array(8)].map((_, i) => (
              <div key={i} style={{ height: '220px', borderRadius: '16px', background: 'linear-gradient(90deg, #F3F4F6 25%, #E5E7EB 50%, #F3F4F6 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: '#6B7280' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
            <p style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: '0.5rem' }}>No skills found</p>
            <p style={{ fontSize: '0.9rem' }}>Try adjusting your search or filters</p>
            {hasFilters && <button onClick={clearFilters} style={{ marginTop: '1rem', padding: '9px 20px', border: '1.5px solid #E5E7EB', borderRadius: '8px', background: 'transparent', color: '#2563EB', fontWeight: 600, cursor: 'pointer' }}>Clear Filters</button>}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {filtered.map(skill => (
              <SkillCard
                key={skill.id}
                skill={skill}
                onRequest={teacherId => navigate(`/session/request/${teacherId}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
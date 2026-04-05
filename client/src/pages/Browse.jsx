import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Filter, Search, SlidersHorizontal, Sparkles, Star, X } from 'lucide-react'
import api from '../api/axios'

const CATEGORIES = ['All Categories', 'Technology', 'Design', 'Music', 'Language', 'Business', 'Other']
const LEVELS = ['All Levels', 'Beginner', 'Intermediate', 'Advanced']
const LEVEL_COLORS = {
  Beginner: 'rgba(61, 217, 164, 0.28)',
  Intermediate: 'rgba(33, 195, 252, 0.28)',
  Advanced: 'rgba(137, 81, 255, 0.32)',
}

function SkillCard({ skill, onRequest }) {
  const teacherName = skill.offeredByUser?.name || skill.user?.name || 'Unknown Mentor'
  const initial = teacherName[0]?.toUpperCase() || '?'
  const teacherId = skill.offeredBy || skill.userId

  return (
    <article className="glass-card skill-card hover-lift" style={{ display: 'grid', gap: '16px' }}>
      <div
        style={{
          height: '148px',
          borderRadius: '20px',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(137,81,255,0.28), rgba(14,67,251,0.24), rgba(33,195,252,0.18))',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="floating-orb" style={{ top: '18%', left: '12%', width: '90px', height: '90px', background: 'radial-gradient(circle, rgba(255,255,255,0.18), transparent 72%)' }} />
        <div className="floating-orb" style={{ right: '8%', bottom: '8%', width: '70px', height: '70px', background: 'radial-gradient(circle, rgba(33,195,252,0.24), transparent 70%)', animationDelay: '-5s' }} />
        <div style={{ position: 'absolute', top: '16px', left: '16px' }} className="pill-badge status-confirmed">
          <Sparkles size={14} />
          Featured mentor
        </div>
        <div style={{ position: 'absolute', bottom: '16px', left: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '18px', display: 'grid', placeItems: 'center', background: 'rgba(255,255,255,0.14)', fontWeight: 800, fontSize: '1.05rem', backdropFilter: 'blur(10px)' }}>
            {initial}
          </div>
          <div>
            <div style={{ fontWeight: 700 }}>{teacherName}</div>
            <div style={{ color: 'var(--muted)', fontSize: '0.84rem' }}>1:1 guided session</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
        <div>
          <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.12rem', lineHeight: 1.1 }}>{skill.title}</h3>
          <p style={{ margin: '8px 0 0', color: 'var(--muted)', fontSize: '0.9rem' }}>
            {skill.description || 'Hands-on coaching with tactical guidance, feedback loops, and clear next steps.'}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#f8c65f', fontWeight: 700 }}>
          <Star size={14} fill="currentColor" />
          <span style={{ color: 'var(--text)' }}>{skill.offeredByUser?.rating || '4.9'}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <span className="pill-badge" style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}>{skill.category}</span>
        <span className="pill-badge" style={{ background: LEVEL_COLORS[skill.level] || 'rgba(255,255,255,0.08)', borderColor: 'transparent' }}>{skill.level}</span>
      </div>

      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>Fast response. Flexible scheduling.</div>
        <button type="button" onClick={() => teacherId && onRequest(teacherId)} className="gradient-button" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
          Request session
          <ArrowRight size={16} />
        </button>
      </div>
    </article>
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
    api.get('/skills').then((response) => {
      setSkills(response.data || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    return skills.filter((skill) => {
      const q = search.toLowerCase()
      const teacherName = skill.offeredByUser?.name || skill.user?.name || ''
      return (
        (!search || skill.title?.toLowerCase().includes(q) || (skill.description || '').toLowerCase().includes(q) || teacherName.toLowerCase().includes(q)) &&
        (category === 'All Categories' || skill.category === category) &&
        (level === 'All Levels' || skill.level === level)
      )
    })
  }, [skills, search, category, level])

  const hasFilters = search || category !== 'All Categories' || level !== 'All Levels'

  return (
    <div className="page-shell">
      <div className="page-content" style={{ display: 'grid', gap: '22px' }}>
        <section className="glass-card surface-grid" style={{ padding: '30px', position: 'relative', overflow: 'hidden' }}>
          <div className="floating-orb" style={{ top: '-18px', right: '14%', width: '170px', height: '170px', background: 'radial-gradient(circle, rgba(137,81,255,0.28), transparent 68%)' }} />
          <div className="floating-orb" style={{ bottom: '-20px', left: '8%', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(33,195,252,0.22), transparent 68%)', animationDelay: '-6s' }} />
          <div className="eyebrow">
            <Filter size={14} />
            Curated marketplace
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', marginTop: '18px', flexWrap: 'wrap' }}>
            <div>
              <h1 className="section-heading">Discover premium skill exchanges</h1>
              <p className="section-subtitle">Browse mentors, creators, operators, and specialists ready to teach through live sessions.</p>
            </div>
            <div className="glass-card soft" style={{ padding: '14px 16px', minWidth: '180px' }}>
              <div style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>Available now</div>
              <div style={{ marginTop: '4px', fontWeight: 800, fontFamily: 'var(--font-display)', fontSize: '2rem' }}>{loading ? '--' : filtered.length}</div>
            </div>
          </div>
        </section>

        <section className="glass-card" style={{ padding: '22px', display: 'grid', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <SlidersHorizontal size={18} color="#21C3FC" />
              <span style={{ fontWeight: 700 }}>Filters</span>
            </div>
            {hasFilters && (
              <button type="button" className="ghost-button" onClick={() => {
                setSearch('')
                setCategory('All Categories')
                setLevel('All Levels')
              }} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <X size={15} />
                Clear all
              </button>
            )}
          </div>

          <div className="card-grid" style={{ gridTemplateColumns: 'minmax(0, 2fr) repeat(2, minmax(180px, 0.8fr))' }}>
            <div className="field-shell">
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search skills or mentors" />
              <label>Search skills or mentors</label>
              <Search size={18} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
            </div>
            <div className="field-shell">
              <select value={category} onChange={(event) => setCategory(event.target.value)}>
                {CATEGORIES.map((item) => <option key={item}>{item}</option>)}
              </select>
              <label>Category</label>
            </div>
            <div className="field-shell">
              <select value={level} onChange={(event) => setLevel(event.target.value)}>
                {LEVELS.map((item) => <option key={item}>{item}</option>)}
              </select>
              <label>Level</label>
            </div>
          </div>
        </section>

        <section style={{ display: 'grid', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{loading ? 'Loading marketplace...' : `${filtered.length} sessions available`}</div>
              <div style={{ color: 'var(--muted)', fontSize: '0.86rem' }}>Responsive grid with hover reveals, polished cards, and mentor metadata.</div>
            </div>
            <div className="pill-badge status-confirmed">Full width grid</div>
          </div>

          {loading ? (
            <div className="browse-grid">
              {Array.from({ length: 8 }).map((_, index) => <div key={index} className="glass-card skeleton" style={{ minHeight: '290px', borderRadius: '26px' }} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="glass-card" style={{ padding: '48px 24px', textAlign: 'center' }}>
              <div style={{ width: '86px', height: '86px', borderRadius: '28px', margin: '0 auto 16px', display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg, rgba(137,81,255,0.24), rgba(33,195,252,0.2))' }}>
                <Search size={34} />
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', marginBottom: '8px' }}>Nothing matched your filters</div>
              <div style={{ color: 'var(--muted)', marginBottom: '18px' }}>Try widening the search, changing the category, or clearing the level filter.</div>
              {hasFilters && <button type="button" className="secondary-button" onClick={() => {
                setSearch('')
                setCategory('All Categories')
                setLevel('All Levels')
              }}>Reset filters</button>}
            </div>
          ) : (
            <div className="browse-grid">
              {filtered.map((skill) => (
                <SkillCard key={skill.id} skill={skill} onRequest={(teacherId) => navigate(`/session/request/${teacherId}`)} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}


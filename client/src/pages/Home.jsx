import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CalendarClock, GraduationCap, Sparkles, Users } from 'lucide-react'
import api from '../api/axios'

const FEATURED_FALLBACK = [
  { id: '1', title: 'React Development', category: 'Technology', level: 'Advanced', user: { name: 'Sarah Chen' } },
  { id: '2', title: 'Python Programming', category: 'Technology', level: 'Intermediate', user: { name: 'Alex Kim' } },
  { id: '3', title: 'Graphic Design', category: 'Design', level: 'Beginner', user: { name: 'Priya Nair' } },
  { id: '4', title: 'Guitar Lessons', category: 'Music', level: 'Beginner', user: { name: 'Marco Silva' } },
]

function FeaturedCard({ skill }) {
  return (
    <article className="glass-card hover-lift" style={{ minWidth: '310px', padding: '22px', display: 'grid', gap: '16px' }}>
      <div style={{ height: '130px', borderRadius: '20px', background: 'linear-gradient(135deg, rgba(137,81,255,0.24), rgba(14,67,251,0.22), rgba(33,195,252,0.16))', position: 'relative', overflow: 'hidden' }}>
        <div className="floating-orb" style={{ top: '18px', right: '18px', width: '72px', height: '72px', background: 'radial-gradient(circle, rgba(255,255,255,0.16), transparent 70%)' }} />
        <div style={{ position: 'absolute', left: '18px', bottom: '18px' }}>
          <div className="pill-badge" style={{ background: 'rgba(255,255,255,0.1)' }}>{skill.level}</div>
        </div>
      </div>
      <div>
        <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>{skill.title}</h3>
        <p style={{ margin: '8px 0 0', color: 'var(--muted)' }}>Taught by {skill.user?.name || 'Expert mentor'} · {skill.category}</p>
      </div>
      <Link to="/browse" className="secondary-button" style={{ width: 'fit-content' }}>Explore session</Link>
    </article>
  )
}

export default function Home() {
  const [skills, setSkills] = useState([])

  useEffect(() => {
    api.get('/skills').then((response) => setSkills((response.data || []).slice(0, 8))).catch(() => setSkills(FEATURED_FALLBACK))
  }, [])

  const featured = skills.length > 0 ? skills : FEATURED_FALLBACK

  return (
    <div className="page-shell">
      <div className="page-content" style={{ display: 'grid', gap: '22px' }}>
        <section className="glass-card surface-grid" style={{ position: 'relative', overflow: 'hidden', padding: '38px' }}>
          <div className="floating-orb" style={{ top: '-20px', right: '10%', width: '180px', height: '180px', background: 'radial-gradient(circle, rgba(137,81,255,0.3), transparent 70%)' }} />
          <div className="floating-orb" style={{ bottom: '-40px', left: '12%', width: '160px', height: '160px', background: 'radial-gradient(circle, rgba(33,195,252,0.24), transparent 70%)', animationDelay: '-5s' }} />
          <div className="eyebrow"><Sparkles size={14} /> Premium learning marketplace</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(320px, 0.8fr)', gap: '24px', alignItems: 'center', marginTop: '24px' }}>
            <div>
              <h1 className="section-heading" style={{ fontSize: 'clamp(2.8rem, 6vw, 5rem)' }}>
                Learn, teach, and trade expertise in a <span className="gradient-text">true SaaS workspace</span>
              </h1>
              <p className="section-subtitle" style={{ maxWidth: '760px', fontSize: '1.02rem', marginTop: '16px' }}>
                SkillSwap pairs ambitious learners with peer mentors through premium scheduling, progress tracking, and collaborative sessions.
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '24px' }}>
                <Link to="/browse" className="gradient-button" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  Explore skills
                  <ArrowRight size={16} />
                </Link>
                <Link to="/register" className="secondary-button">Become a mentor</Link>
              </div>
            </div>

            <div className="glass-card soft" style={{ padding: '22px', display: 'grid', gap: '14px' }}>
              {[
                { icon: GraduationCap, label: 'Expert-led exchanges', value: '2,400+' },
                { icon: Users, label: 'Active members', value: '8,000+' },
                { icon: CalendarClock, label: 'Sessions completed', value: '15,000+' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '18px', background: 'rgba(255,255,255,0.04)' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '16px', display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg, rgba(137,81,255,0.22), rgba(33,195,252,0.2))' }}>
                    <Icon size={18} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>{value}</div>
                    <div style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>{label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="card-grid" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
          {[
            { title: 'Find a skill', desc: 'Explore a polished marketplace of mentors across tech, design, music, language, and business.' },
            { title: 'Book a session', desc: 'Use scheduling, notes, and profile insights to request thoughtful, goal-driven sessions.' },
            { title: 'Track momentum', desc: 'Stay inside a dashboard with progress, confirmed sessions, and future recommendations.' },
          ].map((item) => (
            <div key={item.title} className="glass-card hover-lift" style={{ padding: '24px' }}>
              <div className="eyebrow" style={{ marginBottom: '14px' }}>{item.title}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem', marginBottom: '8px' }}>{item.title}</div>
              <div style={{ color: 'var(--muted)' }}>{item.desc}</div>
            </div>
          ))}
        </section>

        <section className="glass-card" style={{ padding: '26px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.4rem' }}>Featured skill drops</div>
              <div style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>High-signal sessions from the SkillSwap community.</div>
            </div>
            <Link to="/browse" className="secondary-button">View all</Link>
          </div>
          <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '6px' }}>
            {featured.map((skill) => <FeaturedCard key={skill.id} skill={skill} />)}
          </div>
        </section>
      </div>
    </div>
  )
}


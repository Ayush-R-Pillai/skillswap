import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Users, Calendar, Star, ArrowRight } from 'lucide-react'
import api from '../api/axios'

const FEATURED_FALLBACK = [
  { id: '1', title: 'React Development', category: 'Technology', level: 'Advanced', user: { name: 'Sarah Chen' } },
  { id: '2', title: 'Python Programming', category: 'Technology', level: 'Intermediate', user: { name: 'Alex Kim' } },
  { id: '3', title: 'Graphic Design', category: 'Design', level: 'Beginner', user: { name: 'Priya Nair' } },
  { id: '4', title: 'Guitar Lessons', category: 'Music', level: 'Beginner', user: { name: 'Marco Silva' } },
  { id: '5', title: 'Spanish Language', category: 'Language', level: 'Intermediate', user: { name: 'Luna Torres' } },
  { id: '6', title: 'UI/UX Design', category: 'Design', level: 'Advanced', user: { name: 'James Park' } },
]

const LEVEL_COLORS = { Beginner: '#14B8A6', Intermediate: '#2563EB', Advanced: '#8B5CF6' }

function SkillCard({ skill, index }) {
  const [hovered, setHovered] = useState(false)
  const color = LEVEL_COLORS[skill.level] || '#2563EB'

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flexShrink: 0, width: '280px',
        background: '#fff', border: `1.5px solid ${hovered ? '#2563EB40' : '#E5E7EB'}`,
        borderRadius: '16px', padding: '1.25rem',
        boxShadow: hovered ? '0 8px 32px rgba(37,99,235,0.1)' : '0 2px 8px rgba(0,0,0,0.05)',
        transition: 'all 0.2s ease',
        transform: hovered ? 'translateY(-4px)' : 'none',
        animation: `fadeUp 0.5s ease both`,
        animationDelay: `${index * 0.08}s`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: `linear-gradient(135deg, ${color}22, ${color}44)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 700, color }}>
          {skill.user?.name?.[0] || '?'}
        </div>
        <div>
          <p style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1A1A1A' }}>{skill.user?.name}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
            <Star size={13} fill="#FBBF24" color="#FBBF24" />
            <span style={{ fontSize: '0.78rem', color: '#6B7280' }}>4.9</span>
          </div>
        </div>
      </div>

      <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#1A1A1A', marginBottom: '10px', lineHeight: 1.3 }}>{skill.title}</h4>

      <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
        <span style={{ padding: '3px 10px', background: '#F3F4F6', borderRadius: '6px', fontSize: '0.75rem', color: '#6B7280', fontWeight: 500 }}>{skill.category}</span>
        <span style={{ padding: '3px 10px', background: `${color}15`, borderRadius: '6px', fontSize: '0.75rem', color, fontWeight: 500 }}>{skill.level}</span>
      </div>

      <Link to={`/session/request/${skill.userId || skill.id}`} style={{
        display: 'block', textAlign: 'center', padding: '9px',
        background: hovered ? '#14B8A6' : 'transparent',
        border: `1.5px solid ${hovered ? '#14B8A6' : '#E5E7EB'}`,
        color: hovered ? '#fff' : '#6B7280',
        borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600,
        transition: 'all 0.2s',
      }}>Request Session</Link>
    </div>
  )
}

export default function Home() {
  const [skills, setSkills] = useState([])

  useEffect(() => {
    api.get('/skills').then(r => setSkills(r.data.slice(0, 8))).catch(() => setSkills(FEATURED_FALLBACK))
  }, [])

  const featured = skills.length > 0 ? skills : FEATURED_FALLBACK

  return (
    <div style={{ minHeight: '100vh', background: '#FAFBFC' }}>

      {/* ── Hero ── */}
      <section style={{
        background: 'linear-gradient(135deg, #EFF6FF 0%, #F0FDFA 50%, #FAFBFC 100%)',
        padding: 'clamp(4rem, 10vw, 6rem) 1.5rem',
        borderBottom: '1px solid #E5E7EB',
      }}>
        <div style={{ maxWidth: '860px', margin: '0 auto', textAlign: 'center', animation: 'fadeUp 0.6s ease both' }}>
          <h1 style={{ fontSize: 'clamp(2.2rem, 6vw, 3.8rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', color: '#1A1A1A', marginBottom: '1.25rem' }}>
            Learn Anything<br />
            <span style={{ background: 'linear-gradient(135deg, #2563EB, #14B8A6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>from Anyone</span>
          </h1>
          <p style={{ fontSize: '1.15rem', color: '#6B7280', maxWidth: '560px', margin: '0 auto 2.25rem', lineHeight: 1.7 }}>
            Connect with peers worldwide to exchange skills, learn together, and grow your expertise in a supportive community.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/browse" style={{ padding: '13px 28px', background: '#2563EB', color: '#fff', borderRadius: '10px', fontWeight: 700, fontSize: '1rem', boxShadow: '0 4px 16px #2563EB30', display: 'flex', alignItems: 'center', gap: '6px' }}>
              Explore Skills <ArrowRight size={18} />
            </Link>
            <Link to="/register" style={{ padding: '13px 28px', background: '#fff', border: '2px solid #E5E7EB', color: '#1A1A1A', borderRadius: '10px', fontWeight: 600, fontSize: '1rem' }}>
              Share a Skill
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section style={{ background: '#fff', borderBottom: '1px solid #E5E7EB', padding: '2.5rem 1.5rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', textAlign: 'center', gap: '1px' }}>
          {[
            { value: '2,400+', label: 'Skills Listed' },
            { value: '8,000+', label: 'Active Members' },
            { value: '15,000+', label: 'Sessions Completed' },
          ].map(({ value, label }) => (
            <div key={label} style={{ padding: '1.5rem 1rem' }}>
              <div style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 800, color: '#1A1A1A', letterSpacing: '-0.02em' }}>{value}</div>
              <div style={{ fontSize: '0.85rem', color: '#6B7280', marginTop: '4px', fontWeight: 500 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it Works ── */}
      <section style={{ padding: 'clamp(3rem, 8vw, 5rem) 1.5rem', background: '#FAFBFC' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 800, color: '#1A1A1A', letterSpacing: '-0.02em', marginBottom: '3rem' }}>How It Works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {[
              { icon: Search, title: '1. Find a Skill', desc: 'Browse our community and discover skills you want to learn from experienced peers.', color: '#2563EB' },
              { icon: Calendar, title: '2. Book a Session', desc: 'Schedule a 1-on-1 session at a time that works for both of you.', color: '#14B8A6' },
              { icon: Users, title: '3. Learn & Teach', desc: 'Exchange knowledge, share expertise, and grow together as a community.', color: '#8B5CF6' },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} style={{
                background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: '16px', padding: '2rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)', transition: 'box-shadow 0.2s, transform 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-4px)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'none' }}
              >
                <div style={{ width: '52px', height: '52px', background: `${color}15`, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  <Icon size={24} color={color} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1A1A1A', marginBottom: '0.6rem' }}>{title}</h3>
                <p style={{ color: '#6B7280', fontSize: '0.9rem', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Skills ── */}
      <section style={{ padding: 'clamp(3rem, 8vw, 5rem) 0', background: '#F3F4F6' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', fontWeight: 800, color: '#1A1A1A', letterSpacing: '-0.02em' }}>Featured Skills</h2>
            <Link to="/browse" style={{ color: '#2563EB', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div style={{ overflowX: 'auto', paddingBottom: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', padding: '0.5rem 1.5rem 0.5rem' }}>
              {featured.map((skill, i) => <SkillCard key={skill.id} skill={skill} index={i} />)}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: 'clamp(3rem, 8vw, 5rem) 1.5rem', background: '#2563EB', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', animation: 'fadeIn 0.6s ease both' }}>
          <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 800, color: '#fff', marginBottom: '1rem', letterSpacing: '-0.02em' }}>Ready to Start Learning?</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.05rem', marginBottom: '2rem', lineHeight: 1.6 }}>
            Join thousands of learners sharing knowledge and growing together.
          </p>
          <Link to="/register" style={{ padding: '13px 32px', background: '#fff', color: '#2563EB', borderRadius: '10px', fontWeight: 700, fontSize: '1rem', boxShadow: '0 4px 16px rgba(0,0,0,0.15)', display: 'inline-block' }}>
            Join SkillSwap Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#1A1A1A', padding: '2rem 1.5rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>
        © 2024 SkillSwap — built with React + Node.js
      </footer>
    </div>
  )
}
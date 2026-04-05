import { useNavigate } from 'react-router-dom'
export default function SkillCard({ skill }) {
  const navigate = useNavigate()
  return (
    <div style={{backgroundColor:'#DBE2EF',borderRadius:'12px',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'0.6rem',boxShadow:'0 2px 8px rgba(0,0,0,0.08)'}}>
      <div style={{display:'flex',justifyContent:'space-between'}}>
        <span style={{backgroundColor:'#3F72AF',color:'#fff',fontSize:'0.75rem',fontWeight:600,padding:'3px 10px',borderRadius:'20px'}}>{skill.level}</span>
        <span style={{fontSize:'0.8rem',color:'#3F72AF'}}>{skill.category}</span>
      </div>
      <h3 style={{margin:0,color:'#112D4E'}}>{skill.title}</h3>
      <p style={{margin:0,fontSize:'0.875rem',color:'#444'}}>{skill.description}</p>
      {skill.user && <p style={{margin:0,fontSize:'0.8rem',color:'#666',fontStyle:'italic'}}>by {skill.user.name}</p>}
      <button onClick={() => navigate(`/session/request/${skill.userId}`)} style={{backgroundColor:'#3F72AF',color:'#fff',border:'none',borderRadius:'8px',padding:'8px',cursor:'pointer',fontWeight:600}}>Request Session</button>
    </div>
  )
}

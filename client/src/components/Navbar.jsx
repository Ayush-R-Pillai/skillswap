import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const handleLogout = () => { logout(); navigate('/') }
  return (
    <nav style={{backgroundColor:'#112D4E',padding:'0 2rem',height:'60px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:100}}>
      <Link to="/" style={{color:'#fff',fontWeight:700,fontSize:'1.3rem',textDecoration:'none'}}>SkillSwap</Link>
      <div style={{display:'flex',alignItems:'center',gap:'1.5rem'}}>
        <Link to="/browse" style={{color:'#DBE2EF',textDecoration:'none'}}>Browse</Link>
        {user ? (<>
          <Link to="/dashboard" style={{color:'#DBE2EF',textDecoration:'none'}}>Dashboard</Link>
          <Link to={`/profile/${user.id}`} style={{color:'#DBE2EF',textDecoration:'none'}}>{user.name}</Link>
          <button onClick={handleLogout} style={{background:'transparent',border:'1px solid #DBE2EF',color:'#DBE2EF',padding:'6px 14px',borderRadius:'6px',cursor:'pointer'}}>Logout</button>
        </>) : (<>
          <Link to="/login" style={{color:'#DBE2EF',textDecoration:'none'}}>Login</Link>
          <Link to="/register" style={{background:'#3F72AF',color:'#fff',padding:'6px 16px',borderRadius:'6px',textDecoration:'none'}}>Sign Up</Link>
        </>)}
      </div>
    </nav>
  )
}

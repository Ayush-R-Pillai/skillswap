import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Browse from './pages/Browse'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Dashboard from './pages/Dashboard'
import SessionRequest from './pages/SessionRequest'
import ChatPage from './pages/ChatPage'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-shell">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/session/request/:id" element={<SessionRequest />} />
            <Route path="/chat/:sessionId" element={<ChatPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App

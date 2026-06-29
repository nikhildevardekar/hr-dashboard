import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Candidates from './pages/Candidates'
import Interviews from './pages/Interviews'
import Analytics from './pages/Analytics'
import CandidateProfile from './pages/CandidateProfile'
import Calendar from './pages/Calendar'
import Leaderboard from './pages/Leaderboard'
import Report from './pages/Report'
import Register from './pages/Register'
import Login from './pages/Login'

function App() {
  const [user, setUser] = useState(localStorage.getItem('name'))
  const [role, setRole] = useState(localStorage.getItem('role'))

  const handleLogin = (name, role) => { setUser(name); setRole(role) }
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('name')
    localStorage.removeItem('role')
    setUser(null); setRole(null)
  }

  if (!user) return <Login onLogin={handleLogin} />

  return (
    <BrowserRouter>
      <div className="flex h-screen bg-gray-100">
        <Sidebar onLogout={handleLogout} user={user} role={role} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-white border-b border-gray-200 px-6 py-3 flex justify-end items-center">
            <Navbar />
          </div>
          <div className="flex-1 overflow-auto p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/candidates" element={<Candidates />} />
              <Route path="/candidates/:id" element={<CandidateProfile />} />
              <Route path="/interviews" element={<Interviews />} />
              <Route path="/calendar" element={<Calendar />} />
              {role === 'manager' && <Route path="/analytics" element={<Analytics />} />}
              {role === 'manager' && <Route path="/leaderboard" element={<Leaderboard />} />}
              {role === 'manager' && <Route path="/report" element={<Report />} />}
              {role === 'manager' && <Route path="/register" element={<Register />} />}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
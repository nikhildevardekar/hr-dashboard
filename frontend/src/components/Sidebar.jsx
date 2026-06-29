import { Link, useLocation } from 'react-router-dom'

function Sidebar({ onLogout, user, role }) {
  const location = useLocation()

  const hrLinks = [
    { path: '/', label: 'Dashboard' },
    { path: '/candidates', label: 'Candidates' },
    { path: '/interviews', label: 'Interviews' },
    { path: '/calendar', label: 'Calendar' },
  ]

  const managerLinks = [
    { path: '/', label: 'Dashboard' },
    { path: '/candidates', label: 'Candidates' },
    { path: '/interviews', label: 'Interviews' },
    { path: '/calendar', label: 'Calendar' },
    { path: '/analytics', label: 'Manager Analytics' },
    { path: '/leaderboard', label: 'HR Leaderboard' },
    { path: '/report', label: 'Print Report' },
    { path: '/register', label: 'Register HR' },
  ]

  const links = role === 'manager' ? managerLinks : hrLinks

  return (
    <div className="w-56 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-5 border-b border-gray-200">
        <h1 className="text-lg font-semibold text-gray-800">HR Dashboard</h1>
        <p className="text-xs text-gray-400 mt-1">Welcome, {user}</p>
        <span className={'text-xs font-medium px-2 py-0.5 rounded-full mt-2 inline-block ' + (
          role === 'manager'
            ? 'bg-purple-100 text-purple-700'
            : 'bg-blue-100 text-blue-700'
        )}>
          {role === 'manager' ? 'Manager' : 'HR'}
        </span>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {links.map(link => (
          <Link
            key={link.path}
            to={link.path}
            className={'block px-4 py-2 rounded-lg text-sm font-medium transition-colors ' + (
              location.pathname === link.path
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={onLogout}
          className="w-full text-sm text-gray-500 hover:text-red-500 text-left px-2 py-1"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}

export default Sidebar
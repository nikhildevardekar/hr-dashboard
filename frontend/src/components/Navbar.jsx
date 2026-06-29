import { useEffect, useState } from 'react'
import api from '../api'

function Navbar() {
  const [notifications, setNotifications] = useState([])
  const [open, setOpen] = useState(false)
  const [unread, setUnread] = useState(0)

 

  const fetchNotifications = () => {
    api.get('/api/candidates').then(res => {
      const recent = res.data
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10)
        .map(c => ({
          id: c._id,
          message: `${c.name} applied for ${c.position}`,
          time: new Date(c.createdAt).toLocaleDateString('en-IN'),
          status: c.status,
          read: false
        }))
      setNotifications(recent)
      setUnread(recent.length)
    })
  }
   useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const markAllRead = () => {
    setUnread(0)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const statusColors = {
    Applied: 'bg-blue-100 text-blue-700',
    Shortlisted: 'bg-yellow-100 text-yellow-700',
    Interviewed: 'bg-purple-100 text-purple-700',
    Hired: 'bg-green-100 text-green-700',
    Rejected: 'bg-red-100 text-red-700',
  }

  return (
    <div className="relative">
      <button
        onClick={() => { setOpen(!open); if (!open) markAllRead() }}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-medium">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>
            <button onClick={markAllRead} className="text-xs text-blue-600 hover:underline">
              Mark all read
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-6">No notifications</p>
            ) : (
              notifications.map(n => (
                <div key={n.id} className={'px-4 py-3 border-b border-gray-50 hover:bg-gray-50 ' + (!n.read ? 'bg-blue-50' : '')}>
                  <p className="text-sm text-gray-700">{n.message}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className={'text-xs font-medium px-2 py-0.5 rounded-full ' + statusColors[n.status]}>
                      {n.status}
                    </span>
                    <span className="text-xs text-gray-400">{n.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Navbar
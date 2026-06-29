import { useEffect, useState } from 'react'
import api from '../api'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const COLORS = {
  Applied: '#3b82f6',
  Shortlisted: '#f59e0b',
  Interviewed: '#8b5cf6',
  Hired: '#10b981',
  Rejected: '#ef4444',
}

function Dashboard() {
  const [candidates, setCandidates] = useState([])

  useEffect(() => {
    api.get('/api/candidates').then(res => setCandidates(res.data))
  }, [])

  const stats = {
    total: candidates.length,
    shortlisted: candidates.filter(c => c.status === 'Shortlisted').length,
    interviewed: candidates.filter(c => c.status === 'Interviewed').length,
    hired: candidates.filter(c => c.status === 'Hired').length,
  }

  const pieData = ['Applied', 'Shortlisted', 'Interviewed', 'Hired', 'Rejected']
    .map(status => ({ name: status, value: candidates.filter(c => c.status === status).length }))
    .filter(d => d.value > 0)

  const monthlyData = () => {
    const months = {}
    candidates.forEach(c => {
      const month = new Date(c.createdAt).toLocaleString('default', { month: 'short' })
      months[month] = (months[month] || 0) + 1
    })
    return Object.entries(months).map(([month, count]) => ({ month, count }))
  }

  const cards = [
    { label: 'Total Candidates', value: stats.total, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Shortlisted', value: stats.shortlisted, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Interviewed', value: stats.interviewed, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Hired', value: stats.hired, color: 'text-green-600', bg: 'bg-green-50' },
  ]

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Overview</h2>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {cards.map(card => (
          <div key={card.label} className={'rounded-xl p-5 border border-gray-100 ' + card.bg}>
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className={'text-3xl font-semibold mt-1 ' + card.color}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-base font-medium text-gray-700 mb-4">Status Breakdown</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100}
                  dataKey="value" label={({ name, value }) => name + ': ' + value}>
                  {pieData.map(entry => (
                    <Cell key={entry.name} fill={COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm text-center py-16">No data yet</p>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-base font-medium text-gray-700 mb-4">Applications by Month</h3>
          {monthlyData().length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyData()}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm text-center py-16">No data yet</p>
          )}
        </div>
      </div>

      <div className="mt-6 bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="text-base font-medium text-gray-700 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {candidates
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5)
            .map(c => (
              <div key={c._id} className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                <span className="text-gray-700 font-medium">{c.name}</span>
                <span className="text-gray-400">applied for</span>
                <span className="text-gray-700">{c.position}</span>
                <span className="text-gray-400 ml-auto text-xs">
                  {new Date(c.createdAt).toLocaleDateString('en-IN')}
                </span>
              </div>
            ))}
          {candidates.length === 0 && <p className="text-gray-400 text-sm">No activity yet.</p>}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
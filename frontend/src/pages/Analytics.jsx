import { useEffect, useState } from 'react'
import api from '../api'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'

const COLORS = {
  Applied: '#3b82f6',
  Shortlisted: '#f59e0b',
  Interviewed: '#8b5cf6',
  Hired: '#10b981',
  Rejected: '#ef4444',
}

function Analytics() {
  const [candidates, setCandidates] = useState([])
  const [interviews, setInterviews] = useState([])

  useEffect(() => {
    api.get('/api/candidates').then(res => setCandidates(res.data))
    api.get('/api/interviews').then(res => setInterviews(res.data))
  }, [])

  const total = candidates.length
  const hired = candidates.filter(c => c.status === 'Hired').length
  const rejected = candidates.filter(c => c.status === 'Rejected').length
  const shortlisted = candidates.filter(c => c.status === 'Shortlisted').length
  const interviewed = candidates.filter(c => c.status === 'Interviewed').length
  const conversionRate = total > 0 ? ((hired / total) * 100).toFixed(1) : 0
  const completedInterviews = interviews.filter(i => i.status === 'Completed').length
  const avgRating = interviews.filter(i => i.rating).length > 0
    ? (interviews.filter(i => i.rating).reduce((sum, i) => sum + Number(i.rating), 0) /
       interviews.filter(i => i.rating).length).toFixed(1)
    : 'N/A'

  const funnelData = [
    { name: 'Applied', value: total, fill: '#3b82f6' },
    { name: 'Shortlisted', value: shortlisted, fill: '#f59e0b' },
    { name: 'Interviewed', value: interviewed, fill: '#8b5cf6' },
    { name: 'Hired', value: hired, fill: '#10b981' },
  ]

  const pieData = Object.entries(
    candidates.reduce((acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1
      return acc
    }, {})
  ).map(([name, value]) => ({ name, value }))

  const monthlyChartData = Object.entries(
    candidates.reduce((acc, c) => {
      const month = new Date(c.createdAt).toLocaleString('default', { month: 'short', year: '2-digit' })
      acc[month] = (acc[month] || 0) + 1
      return acc
    }, {})
  ).map(([month, count]) => ({ month, count }))

  const positionData = Object.entries(
    candidates.reduce((acc, c) => {
      acc[c.position] = (acc[c.position] || 0) + 1
      return acc
    }, {})
  ).map(([position, count]) => ({ position, count }))
    .sort((a, b) => b.count - a.count).slice(0, 6)

  const modeData = Object.entries(
    interviews.reduce((acc, i) => {
      acc[i.mode] = (acc[i.mode] || 0) + 1
      return acc
    }, {})
  ).map(([name, value]) => ({ name, value }))

  const kpis = [
    { label: 'Total Applicants', value: total, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Hired', value: hired, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Rejected', value: rejected, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Conversion Rate', value: conversionRate + '%', color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Total Interviews', value: interviews.length, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Completed Interviews', value: completedInterviews, color: 'text-teal-600', bg: 'bg-teal-50' },
    { label: 'Avg Interview Rating', value: avgRating + (avgRating !== 'N/A' ? '/5' : ''), color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Open Positions', value: candidates.filter(c => c.status === 'Applied' || c.status === 'Shortlisted').length, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ]

  const hrStats = Object.entries(
    candidates.reduce((acc, c) => {
      const name = c.addedByName || 'Unknown'
      if (!acc[name]) acc[name] = { total: 0, shortlisted: 0, interviewed: 0, hired: 0, rejected: 0 }
      acc[name].total++
      if (c.status === 'Shortlisted') acc[name].shortlisted++
      if (c.status === 'Interviewed') acc[name].interviewed++
      if (c.status === 'Hired') acc[name].hired++
      if (c.status === 'Rejected') acc[name].rejected++
      return acc
    }, {})
  )

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Manager Analytics</h2>
        <p className="text-sm text-gray-400 mt-1">Complete HR overview and hiring analysis</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {kpis.map(k => (
          <div key={k.label} className={'rounded-xl p-5 border border-gray-100 ' + k.bg}>
            <p className="text-xs text-gray-500 font-medium">{k.label}</p>
            <p className={'text-2xl font-bold mt-1 ' + k.color}>{k.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-base font-medium text-gray-700 mb-4">Hiring Funnel</h3>
          <div className="space-y-3">
            {funnelData.map(stage => (
              <div key={stage.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 font-medium">{stage.name}</span>
                  <span className="text-gray-800 font-semibold">{stage.value}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-6 overflow-hidden">
                  <div className="h-6 rounded-full flex items-center justify-end pr-2"
                    style={{
                      width: total > 0 ? (stage.value / total * 100) + '%' : '0%',
                      backgroundColor: stage.fill,
                      minWidth: stage.value > 0 ? '2rem' : '0'
                    }}>
                    {stage.value > 0 && (
                      <span className="text-white text-xs font-medium">
                        {total > 0 ? Math.round(stage.value / total * 100) : 0}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-base font-medium text-gray-700 mb-4">Status Breakdown</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                  label={({ name, value }) => name + ': ' + value}>
                  {pieData.map(entry => (
                    <Cell key={entry.name} fill={COLORS[entry.name] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm text-center py-16">No data yet</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-base font-medium text-gray-700 mb-4">Applications by Month</h3>
          {monthlyChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyChartData}>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm text-center py-16">No data yet</p>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-base font-medium text-gray-700 mb-4">Top Positions Applied</h3>
          {positionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={positionData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis type="category" dataKey="position" tick={{ fontSize: 11 }} width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm text-center py-16">No data yet</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-base font-medium text-gray-700 mb-4">Interview Mode Split</h3>
          {modeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={modeData} cx="50%" cy="50%" outerRadius={75} dataKey="value"
                  label={({ name, value }) => name + ': ' + value}>
                  <Cell fill="#3b82f6" />
                  <Cell fill="#10b981" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm text-center py-12">No interviews yet</p>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-base font-medium text-gray-700 mb-4">Interview Status Summary</h3>
          <div className="space-y-4 mt-2">
            {['Scheduled', 'Completed', 'Cancelled'].map(status => {
              const count = interviews.filter(i => i.status === status).length
              const pct = interviews.length > 0 ? Math.round(count / interviews.length * 100) : 0
              return (
                <div key={status}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{status}</span>
                    <span className="text-gray-800 font-medium">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className={'h-2 rounded-full ' + (
                      status === 'Completed' ? 'bg-green-500' :
                      status === 'Cancelled' ? 'bg-red-400' : 'bg-yellow-400'
                    )} style={{ width: pct + '%' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="text-base font-medium text-gray-700 mb-4">HR Performance Breakdown</h3>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['HR Name', 'Total Added', 'Shortlisted', 'Interviewed', 'Hired', 'Rejected', 'Conversion'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hrStats.map(([name, stats]) => (
              <tr key={name} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{name}</td>
                <td className="px-4 py-3 text-gray-600">{stats.total}</td>
                <td className="px-4 py-3 text-yellow-600">{stats.shortlisted}</td>
                <td className="px-4 py-3 text-purple-600">{stats.interviewed}</td>
                <td className="px-4 py-3 text-green-600">{stats.hired}</td>
                <td className="px-4 py-3 text-red-500">{stats.rejected}</td>
                <td className="px-4 py-3 text-blue-600 font-medium">
                  {stats.total > 0 ? ((stats.hired / stats.total) * 100).toFixed(1) + '%' : '0%'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {candidates.length === 0 && (
          <p className="text-center text-gray-400 py-6 text-sm">No data yet</p>
        )}
      </div>
    </div>
  )
}

export default Analytics
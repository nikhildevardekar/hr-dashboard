import { useEffect, useState } from 'react'
import api from '../api'

function Leaderboard() {
  const [candidates, setCandidates] = useState([])
  const [interviews, setInterviews] = useState([])

  useEffect(() => {
    api.get('/api/candidates').then(res => setCandidates(res.data))
    api.get('/api/interviews').then(res => setInterviews(res.data))
  }, [])

  const hrStats = Object.entries(
    candidates.reduce((acc, c) => {
      const name = c.addedByName || 'Unknown'
      if (!acc[name]) acc[name] = {
        name, total: 0, shortlisted: 0,
        interviewed: 0, hired: 0, rejected: 0, score: 0
      }
      acc[name].total++
      if (c.status === 'Shortlisted') acc[name].shortlisted++
      if (c.status === 'Interviewed') acc[name].interviewed++
      if (c.status === 'Hired') acc[name].hired++
      if (c.status === 'Rejected') acc[name].rejected++
      return acc
    }, {})
  ).map(([_, stats]) => ({
    ...stats,
    conversionRate: stats.total > 0 ? ((stats.hired / stats.total) * 100).toFixed(1) : 0,
    score: (stats.hired * 10) + (stats.interviewed * 5) + (stats.shortlisted * 2) + stats.total
  })).sort((a, b) => b.score - a.score)

  const medals = ['🥇', '🥈', '🥉']

  const getRankColor = (index) => {
    if (index === 0) return 'border-yellow-300 bg-yellow-50'
    if (index === 1) return 'border-gray-300 bg-gray-50'
    if (index === 2) return 'border-orange-300 bg-orange-50'
    return 'border-gray-100 bg-white'
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">HR Leaderboard</h2>
        <p className="text-sm text-gray-400 mt-1">Ranked by performance score</p>
      </div>

      {/* Score explanation */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 text-sm text-blue-700">
        Score = Hired ×10 + Interviewed ×5 + Shortlisted ×2 + Total Added ×1
      </div>

      {/* Top 3 podium */}
      {hrStats.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {hrStats.slice(0, 3).map((hr, i) => (
            <div key={hr.name}
              className={'border-2 rounded-xl p-5 text-center ' + getRankColor(i)}>
              <div className="text-3xl mb-2">{medals[i]}</div>
              <p className="font-semibold text-gray-800">{hr.name}</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{hr.score}</p>
              <p className="text-xs text-gray-400 mt-1">points</p>
              <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                <div className="bg-white rounded-lg p-2">
                  <p className="text-gray-400">Hired</p>
                  <p className="font-semibold text-green-600">{hr.hired}</p>
                </div>
                <div className="bg-white rounded-lg p-2">
                  <p className="text-gray-400">Rate</p>
                  <p className="font-semibold text-blue-600">{hr.conversionRate}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full leaderboard table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Rank', 'HR Name', 'Total', 'Shortlisted', 'Interviewed', 'Hired', 'Rejected', 'Rate', 'Score'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hrStats.map((hr, i) => (
              <tr key={hr.name} className={'border-b border-gray-100 hover:bg-gray-50 ' + (i < 3 ? 'font-medium' : '')}>
                <td className="px-4 py-3 text-gray-800">
                  {medals[i] || '#' + (i + 1)}
                </td>
                <td className="px-4 py-3 text-gray-800">{hr.name}</td>
                <td className="px-4 py-3 text-gray-600">{hr.total}</td>
                <td className="px-4 py-3 text-yellow-600">{hr.shortlisted}</td>
                <td className="px-4 py-3 text-purple-600">{hr.interviewed}</td>
                <td className="px-4 py-3 text-green-600">{hr.hired}</td>
                <td className="px-4 py-3 text-red-500">{hr.rejected}</td>
                <td className="px-4 py-3 text-blue-600">{hr.conversionRate}%</td>
                <td className="px-4 py-3">
                  <span className="bg-blue-100 text-blue-700 font-semibold px-2 py-1 rounded-full text-xs">
                    {hr.score} pts
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {hrStats.length === 0 && (
          <p className="text-center text-gray-400 py-8 text-sm">No HR data yet</p>
        )}
      </div>
    </div>
  )
}

export default Leaderboard
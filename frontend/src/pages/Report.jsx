import { useEffect, useState, useRef } from 'react'
import api from '../api'

function Report() {
  const [candidates, setCandidates] = useState([])
  const [interviews, setInterviews] = useState([])
  const printRef = useRef()

  useEffect(() => {
    api.get('/api/candidates').then(res => setCandidates(res.data))
    api.get('/api/interviews').then(res => setInterviews(res.data))
  }, [])

  const handlePrint = () => window.print()

  const total = candidates.length
  const hired = candidates.filter(c => c.status === 'Hired').length
  const rejected = candidates.filter(c => c.status === 'Rejected').length
  const shortlisted = candidates.filter(c => c.status === 'Shortlisted').length
  const interviewed = candidates.filter(c => c.status === 'Interviewed').length
  const conversionRate = total > 0 ? ((hired / total) * 100).toFixed(1) : 0

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
      <div className="flex justify-between items-center mb-6 print:hidden">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">HR Report</h2>
          <p className="text-sm text-gray-400 mt-1">
            Generated on {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button onClick={handlePrint}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-blue-700">
          Print / Save as PDF
        </button>
      </div>

      <div ref={printRef} className="bg-white border border-gray-200 rounded-xl p-8">
        {/* Report Header */}
        <div className="border-b border-gray-200 pb-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">HR Recruitment Report</h1>
          <p className="text-gray-500 mt-1">
            Generated on {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Summary KPIs */}
        <h2 className="text-base font-semibold text-gray-700 mb-4">Summary</h2>
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Candidates', value: total },
            { label: 'Shortlisted', value: shortlisted },
            { label: 'Interviewed', value: interviewed },
            { label: 'Hired', value: hired },
            { label: 'Rejected', value: rejected },
            { label: 'Conversion Rate', value: conversionRate + '%' },
          ].map(k => (
            <div key={k.label} className="border border-gray-100 rounded-lg p-4 bg-gray-50">
              <p className="text-xs text-gray-500">{k.label}</p>
              <p className="text-xl font-bold text-gray-800 mt-1">{k.value}</p>
            </div>
          ))}
        </div>

        {/* HR Performance */}
        <h2 className="text-base font-semibold text-gray-700 mb-4">HR Performance</h2>
        <table className="w-full text-sm mb-8 border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              {['HR Name', 'Total', 'Shortlisted', 'Interviewed', 'Hired', 'Rejected', 'Conversion'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium border-b border-gray-200">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hrStats.map(([name, stats]) => (
              <tr key={name} className="border-t border-gray-100">
                <td className="px-4 py-3 font-medium text-gray-800">{name}</td>
                <td className="px-4 py-3 text-gray-600">{stats.total}</td>
                <td className="px-4 py-3 text-gray-600">{stats.shortlisted}</td>
                <td className="px-4 py-3 text-gray-600">{stats.interviewed}</td>
                <td className="px-4 py-3 text-gray-600">{stats.hired}</td>
                <td className="px-4 py-3 text-gray-600">{stats.rejected}</td>
                <td className="px-4 py-3 text-gray-600">
                  {stats.total > 0 ? ((stats.hired / stats.total) * 100).toFixed(1) + '%' : '0%'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* All Candidates */}
        <h2 className="text-base font-semibold text-gray-700 mb-4">All Candidates</h2>
        <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              {['Name', 'Email', 'Position', 'Status', 'Added By', 'Applied On'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium border-b border-gray-200">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {candidates.map(c => (
              <tr key={c._id} className="border-t border-gray-100">
                <td className="px-4 py-3 text-gray-800">{c.name}</td>
                <td className="px-4 py-3 text-gray-600">{c.email}</td>
                <td className="px-4 py-3 text-gray-600">{c.position}</td>
                <td className="px-4 py-3 text-gray-600">{c.status}</td>
                <td className="px-4 py-3 text-gray-600">{c.addedByName || '—'}</td>
                <td className="px-4 py-3 text-gray-600">
                  {new Date(c.createdAt).toLocaleDateString('en-IN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-400">HR Dashboard — Confidential Report</p>
        </div>
      </div>
    </div>
  )
}

export default Report
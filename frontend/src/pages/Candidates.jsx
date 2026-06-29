import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

const statusColors = {
  Applied: 'bg-blue-100 text-blue-700',
  Shortlisted: 'bg-yellow-100 text-yellow-700',
  Interviewed: 'bg-purple-100 text-purple-700',
  Hired: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
}

const emptyForm = {
  name: '', email: '', phone: '', position: '',
  location: '', currentCTC: '', expectedCTC: '',
  noticePeriod: '', remarks: '', status: 'Applied'
}

function Candidates() {
  const navigate = useNavigate()
  const [candidates, setCandidates] = useState([])
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)

  const fetchCandidates = () => {
    api.get('/api/candidates').then(res => setCandidates(res.data))
  }

  useEffect(() => { fetchCandidates() }, [])

  const handleSubmit = () => {
    if (editingId) {
      api.patch('/api/candidates/' + editingId, form).then(() => {
        fetchCandidates()
        setShowForm(false)
        setEditingId(null)
        setForm(emptyForm)
      })
    } else {
      api.post('/api/candidates', form).then(() => {
        fetchCandidates()
        setShowForm(false)
        setForm(emptyForm)
      })
    }
  }

  const handleEdit = (c) => {
    setForm({
      name: c.name || '',
      email: c.email || '',
      phone: c.phone || '',
      position: c.position || '',
      location: c.location || '',
      currentCTC: c.currentCTC || '',
      expectedCTC: c.expectedCTC || '',
      noticePeriod: c.noticePeriod || '',
      remarks: c.remarks || '',
      status: c.status || 'Applied'
    })
    setEditingId(c._id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
  }

  const handleStatus = (id, status) => {
    api.patch('/api/candidates/' + id, { status }).then(() => fetchCandidates())
  }

  const handleDelete = (id) => {
    if (window.confirm('Delete this candidate?')) {
      api.delete('/api/candidates/' + id).then(() => fetchCandidates())
    }
  }

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Position', 'Location', 'Current CTC', 'Expected CTC', 'Notice Period', 'Status', 'Remarks', 'Added By', 'Applied On']
    const rows = candidates.map(c => [
      c.name, c.email, c.phone, c.position,
      c.location, c.currentCTC, c.expectedCTC,
      c.noticePeriod, c.status, c.remarks,
      c.addedByName,
      new Date(c.createdAt).toLocaleDateString('en-IN')
    ])
    const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'candidates.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const filtered = candidates.filter(c => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.position?.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.location?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'All' || c.status === filterStatus
    return matchSearch && matchStatus
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Candidates</h2>
        <div className="flex gap-3">
          <button onClick={exportCSV}
            className="border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50">
            Export CSV
          </button>
          <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(emptyForm) }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
            + Add Candidate
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-3 mb-5">
        <input type="text" placeholder="Search by name, position, email or location..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-400" />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:border-blue-400">
          {['All', 'Applied', 'Shortlisted', 'Interviewed', 'Hired', 'Rejected'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <p className="text-sm text-gray-400 mb-3">
        Showing {filtered.length} of {candidates.length} candidates
      </p>

      {/* Add / Edit Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
          <h3 className="text-base font-medium text-gray-700 mb-4">
            {editingId ? 'Edit Candidate' : 'New Candidate'}
          </h3>

          {/* Basic Info */}
          <p className="text-xs text-gray-400 uppercase font-medium mb-2">Basic Information</p>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <input placeholder="Full Name *"
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
            <input placeholder="Email Address *"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
            <input placeholder="Phone Number"
              value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
            <input placeholder="Position Applied For"
              value={form.position} onChange={e => setForm({ ...form, position: e.target.value })}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
            <input placeholder="Current Location (e.g. Mumbai)"
              value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400">
              {['Applied', 'Shortlisted', 'Interviewed', 'Hired', 'Rejected'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* CTC & Notice Period */}
          <p className="text-xs text-gray-400 uppercase font-medium mb-2">Compensation & Availability</p>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <input placeholder="Current CTC (e.g. 5 LPA)"
              value={form.currentCTC} onChange={e => setForm({ ...form, currentCTC: e.target.value })}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
            <input placeholder="Expected CTC (e.g. 8 LPA)"
              value={form.expectedCTC} onChange={e => setForm({ ...form, expectedCTC: e.target.value })}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
            <select value={form.noticePeriod} onChange={e => setForm({ ...form, noticePeriod: e.target.value })}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400">
              <option value="">Notice Period</option>
              <option value="Immediate">Immediate Joiner</option>
              <option value="15 Days">15 Days</option>
              <option value="30 Days">30 Days</option>
              <option value="45 Days">45 Days</option>
              <option value="60 Days">60 Days</option>
              <option value="90 Days">90 Days</option>
            </select>
          </div>

          {/* Remarks */}
          <p className="text-xs text-gray-400 uppercase font-medium mb-2">Remarks</p>
          <textarea placeholder="Add any additional notes or remarks about this candidate..."
            value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })}
            rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 mb-4" />

          <div className="flex gap-3">
            <button onClick={handleSubmit}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
              {editingId ? 'Update Candidate' : 'Save Candidate'}
            </button>
            <button onClick={handleCancel}
              className="border border-gray-200 px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Candidates Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Name', 'Position', 'Location', 'Current CTC', 'Expected CTC', 'Notice', 'Status', 'Added By', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c._id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-blue-600 hover:underline cursor-pointer"
                    onClick={() => navigate('/candidates/' + c._id)}>
                    {c.name}
                  </p>
                  <p className="text-xs text-gray-400">{c.email}</p>
                </td>
                <td className="px-4 py-3 text-gray-600">{c.position || '—'}</td>
                <td className="px-4 py-3 text-gray-600">{c.location || '—'}</td>
                <td className="px-4 py-3 text-gray-600">{c.currentCTC || '—'}</td>
                <td className="px-4 py-3 text-gray-600">{c.expectedCTC || '—'}</td>
                <td className="px-4 py-3 text-gray-600">{c.noticePeriod || '—'}</td>
                <td className="px-4 py-3">
                  <select value={c.status}
                    onChange={e => handleStatus(c._id, e.target.value)}
                    className={'text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ' + statusColors[c.status]}>
                    {['Applied', 'Shortlisted', 'Interviewed', 'Hired', 'Rejected'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{c.addedByName || '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(c)}
                      className="text-blue-500 hover:text-blue-700 text-xs">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(c._id)}
                      className="text-red-500 hover:text-red-700 text-xs">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center text-gray-400 py-8">
            {search || filterStatus !== 'All' ? 'No candidates match your search.' : 'No candidates yet. Add one!'}
          </p>
        )}
      </div>
    </div>
  )
}

export default Candidates
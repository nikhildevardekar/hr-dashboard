import { useEffect, useState } from 'react'
import api from '../api'

const modeColors = {
  Online: 'bg-blue-100 text-blue-700',
  Offline: 'bg-gray-100 text-gray-700',
}
const statusColors = {
  Scheduled: 'bg-yellow-100 text-yellow-700',
  Completed: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
}

function Interviews() {
  const [interviews, setInterviews] = useState([])
  const [candidates, setCandidates] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({
    candidate: '', date: '', time: '', mode: 'Online', interviewer: ''
  })

  const fetchAll = () => {
    api.get('/api/interviews').then(res => setInterviews(res.data))
    api.get('/api/candidates').then(res => setCandidates(res.data))
  }

  useEffect(() => { fetchAll() }, [])

  const handleSubmit = () => {
    api.post('/api/interviews', form).then(() => {
      fetchAll()
      setShowForm(false)
      setForm({ candidate: '', date: '', time: '', mode: 'Online', interviewer: '' })
    })
  }

  const handleUpdate = (id, data) => {
    api.patch('/api/interviews/' + id, data).then(() => {
      fetchAll()
      setSelected(null)
    })
  }

  const handleDelete = (id) => {
    api.delete('/api/interviews/' + id).then(fetchAll)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Interviews</h2>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
          + Schedule Interview
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
          <h3 className="text-base font-medium text-gray-700 mb-4">Schedule New Interview</h3>
          <div className="grid grid-cols-2 gap-3">
            <select value={form.candidate} onChange={e => setForm({ ...form, candidate: e.target.value })}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400">
              <option value="">Select Candidate</option>
              {candidates.map(c => <option key={c._id} value={c._id}>{c.name} — {c.position}</option>)}
            </select>
            <input type="text" placeholder="Interviewer name" value={form.interviewer}
              onChange={e => setForm({ ...form, interviewer: e.target.value })}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
            <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
            <input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
            <select value={form.mode} onChange={e => setForm({ ...form, mode: e.target.value })}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400">
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
            </select>
          </div>
          <div className="flex gap-3 mt-3">
            <button onClick={handleSubmit}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">Save</button>
            <button onClick={() => setShowForm(false)}
              className="border border-gray-200 px-4 py-2 rounded-lg text-sm text-gray-600">Cancel</button>
          </div>
        </div>
      )}

      {selected && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
          <h3 className="text-base font-medium text-gray-700 mb-4">
            Feedback — {selected.candidate?.name}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <textarea placeholder="Feedback notes..." rows={3}
              defaultValue={selected.feedback}
              onChange={e => setSelected({ ...selected, feedback: e.target.value })}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 col-span-2" />
            <select defaultValue={selected.rating || ''}
              onChange={e => setSelected({ ...selected, rating: e.target.value })}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
              <option value="">Rating</option>
              {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} / 5</option>)}
            </select>
            <select defaultValue={selected.status}
              onChange={e => setSelected({ ...selected, status: e.target.value })}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div className="flex gap-3 mt-3">
            <button onClick={() => handleUpdate(selected._id, {
              feedback: selected.feedback, rating: selected.rating, status: selected.status
            })} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
              Save Feedback
            </button>
            <button onClick={() => setSelected(null)}
              className="border border-gray-200 px-4 py-2 rounded-lg text-sm text-gray-600">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Candidate', 'Position', 'Date', 'Time', 'Mode', 'Interviewer', 'Status', 'Rating', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {interviews.map(i => (
              <tr key={i._id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{i.candidate?.name}</td>
                <td className="px-4 py-3 text-gray-600">{i.candidate?.position}</td>
                <td className="px-4 py-3 text-gray-600">{i.date}</td>
                <td className="px-4 py-3 text-gray-600">{i.time}</td>
                <td className="px-4 py-3">
                  <span className={'text-xs font-medium px-2 py-1 rounded-full ' + modeColors[i.mode]}>
                    {i.mode}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{i.interviewer}</td>
                <td className="px-4 py-3">
                  <span className={'text-xs font-medium px-2 py-1 rounded-full ' + statusColors[i.status]}>
                    {i.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{i.rating ? i.rating + '/5' : '—'}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => setSelected(i)}
                    className="text-blue-500 hover:text-blue-700 text-xs">Feedback</button>
                  <button onClick={() => handleDelete(i._id)}
                    className="text-red-500 hover:text-red-700 text-xs">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {interviews.length === 0 && (
          <p className="text-center text-gray-400 py-8">No interviews scheduled yet.</p>
        )}
      </div>
    </div>
  )
}

export default Interviews
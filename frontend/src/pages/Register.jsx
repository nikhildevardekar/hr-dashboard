import { useState } from 'react'
import api from '../api'

function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'hr' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = () => {
    setError('')
    setSuccess('')
    if (!form.name || !form.email || !form.password) {
      setError('All fields are required')
      return
    }
    setLoading(true)
    api.post('/api/auth/register', form)
      .then(() => {
        setSuccess(form.name + ' has been registered successfully as ' + form.role.toUpperCase() + '!')
        setForm({ name: '', email: '', password: '', role: 'hr' })
      })
      .catch(err => setError(err.response?.data?.message || 'Registration failed'))
      .finally(() => setLoading(false))
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Register New User</h2>
        <p className="text-sm text-gray-400 mt-1">Create a new HR or Manager account</p>
      </div>

      <div className="max-w-lg bg-white border border-gray-200 rounded-xl p-6">

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-100 text-green-600 text-sm px-4 py-3 rounded-lg mb-4">
            {success}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 uppercase font-medium tracking-wide">
              Full Name
            </label>
            <input
              type="text"
              placeholder="e.g. Priya Sharma"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 uppercase font-medium tracking-wide">
              Email Address
            </label>
            <input
              type="email"
              placeholder="e.g. priya@company.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 uppercase font-medium tracking-wide">
              Password
            </label>
            <input
              type="password"
              placeholder="Set a strong password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 uppercase font-medium tracking-wide">
              Role
            </label>
            <select
              value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })}
              className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
            >
              <option value="hr">HR</option>
              <option value="manager">Manager</option>
            </select>
          </div>

          <button
            onClick={handleRegister}
            disabled={loading}
            className={'w-full py-2.5 rounded-lg text-sm font-medium text-white transition-colors ' +
              (loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700')}
          >
            {loading ? 'Registering...' : 'Register Account'}
          </button>
        </div>

        {/* Info box */}
        <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-4">
          <p className="text-xs font-medium text-blue-700 mb-2">Role permissions:</p>
          <div className="space-y-1">
            <p className="text-xs text-blue-600">
              HR — Can add candidates, schedule interviews, view own data only
            </p>
            <p className="text-xs text-blue-600">
              Manager — Can view all HR data, analytics, leaderboard, reports and register new users
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'

const BASE_URL = 'https://hr-dashboard-api-82b4.onrender.com'

const statusColors = {
  Applied: 'bg-blue-100 text-blue-700',
  Shortlisted: 'bg-yellow-100 text-yellow-700',
  Interviewed: 'bg-purple-100 text-purple-700',
  Hired: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
}

function CandidateProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [candidate, setCandidate] = useState(null)
  const [interviews, setInterviews] = useState([])
  const [uploading, setUploading] = useState(false)
  const [uploadMsg, setUploadMsg] = useState('')

  const fetchData = () => {
    api.get('/api/candidates').then(res => {
      setCandidate(res.data.find(c => c._id === id))
    })
    api.get('/api/interviews').then(res => {
      setInterviews(res.data.filter(i => i.candidate?._id === id))
    })
  }

  useEffect(() => { fetchData() }, [id])

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.type !== 'application/pdf') {
      setUploadMsg('Only PDF files allowed!')
      return
    }
    setUploading(true)
    const formData = new FormData()
    formData.append('resume', file)
    try {
      await api.post('/api/candidates/' + id + '/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setUploadMsg('Resume uploaded!')
      fetchData()
    } catch {
      setUploadMsg('Upload failed.')
    }
    setUploading(false)
  }

  if (!candidate) return <div className="text-gray-400 p-8">Loading...</div>

  return (
    <div>
      <button onClick={() => navigate('/candidates')}
        className="text-sm text-blue-600 hover:underline mb-4 block">
        Back to Candidates
      </button>

      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">{candidate.name}</h2>
            <p className="text-gray-500 mt-1">{candidate.position}</p>
            {candidate.addedByName && (
              <p className="text-xs text-gray-400 mt-1">Added by: {candidate.addedByName}</p>
            )}
          </div>
          <span className={'text-sm font-medium px-3 py-1 rounded-full ' + statusColors[candidate.status]}>
            {candidate.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <div>
            <p className="text-xs text-gray-400 uppercase">Email</p>
            <p className="text-sm text-gray-700 mt-1">{candidate.email}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase">Phone</p>
            <p className="text-sm text-gray-700 mt-1">{candidate.phone || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase">Location</p>
            <p className="text-sm text-gray-700 mt-1">{candidate.location || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase">Notice Period</p>
            <p className="text-sm text-gray-700 mt-1">{candidate.noticePeriod || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase">Current CTC</p>
            <p className="text-sm text-gray-700 mt-1">{candidate.currentCTC || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase">Expected CTC</p>
            <p className="text-sm text-gray-700 mt-1">{candidate.expectedCTC || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase">Applied on</p>
            <p className="text-sm text-gray-700 mt-1">
              {new Date(candidate.createdAt).toLocaleDateString('en-IN')}
            </p>
          </div>
          {candidate.remarks && (
            <div className="col-span-2">
              <p className="text-xs text-gray-400 uppercase">Remarks</p>
              <p className="text-sm text-gray-700 mt-1 bg-gray-50 rounded-lg p-3">
                {candidate.remarks}
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 pt-5 border-t border-gray-100">
  <p className="text-xs text-gray-400 uppercase mb-3">Resume</p>
          {candidate.resumeUrl ? (
    <div>
      <div className="flex items-center gap-4 mb-3">
        <span className="text-sm font-medium text-gray-700">PDF Resume</span>
                <a href={candidate.resumeUrl}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-blue-600 hover:underline"
        >
          Open in new tab
        </a>
                <label className="text-xs text-gray-500 cursor-pointer underline hover:text-gray-700">
          Replace
          <input type="file" accept=".pdf" onChange={handleResumeUpload} className="hidden" />
        </label>
      </div>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <iframe
                  src={candidate.resumeUrl}
                  className="w-full"
                  style={{ height: '600px' }}
                  title="Resume"
                />
              </div>
            </div>
          ) : (
            <label className="inline-block px-4 py-2 rounded-lg text-sm cursor-pointer border border-dashed border-gray-300 hover:border-blue-400 hover:text-blue-600">
              {uploading ? 'Uploading...' : 'Upload Resume (PDF)'}
              <input type="file" accept=".pdf" onChange={handleResumeUpload} className="hidden" disabled={uploading} />
            </label>
          )}
          {uploadMsg && (
            <p className={'text-xs mt-2 ' + (uploadMsg.includes('uploaded') ? 'text-green-600' : 'text-red-500')}>
              {uploadMsg}
            </p>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-base font-medium text-gray-700 mb-4">Interview History</h3>
        {interviews.length === 0 ? (
          <p className="text-gray-400 text-sm">No interviews scheduled yet.</p>
        ) : (
          <div className="space-y-3">
            {interviews.map(i => (
              <div key={i._id} className="border border-gray-100 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{i.date} at {i.time}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Interviewer: {i.interviewer} · {i.mode}
                    </p>
                  </div>
                  <span className={'text-xs font-medium px-2 py-1 rounded-full ' + (
                    i.status === 'Completed' ? 'bg-green-100 text-green-700' :
                    i.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  )}>{i.status}</span>
                </div>
                {i.feedback && (
                  <p className="text-sm text-gray-600 mt-2 bg-gray-50 rounded p-2">{i.feedback}</p>
                )}
                {i.rating && (
                  <p className="text-xs text-gray-400 mt-1">Rating: {i.rating} / 5</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default CandidateProfile
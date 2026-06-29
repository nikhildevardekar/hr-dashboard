import { useEffect, useState } from 'react'
import api from '../api'

function Calendar() {
  const [interviews, setInterviews] = useState([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    api.get('/api/interviews').then(res => setInterviews(res.data))
  }, [])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const getInterviewsForDay = (day) => {
    const dateStr = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0')
    return interviews.filter(i => i.date === dateStr)
  }

  const statusColors = {
    Scheduled: 'bg-yellow-400',
    Completed: 'bg-green-400',
    Cancelled: 'bg-red-400',
  }

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Interview Calendar</h2>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button onClick={prevMonth}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 font-medium">
            ← Prev
          </button>
          <h3 className="text-lg font-semibold text-gray-800">{monthName}</h3>
          <button onClick={nextMonth}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 font-medium">
            Next →
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {days.map(d => (
            <div key={d} className="text-center text-xs font-medium text-gray-400 py-2">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {Array(firstDay).fill(null).map((_, i) => (
            <div key={'empty-' + i} className="h-24" />
          ))}
          {Array(daysInMonth).fill(null).map((_, i) => {
            const day = i + 1
            const dayInterviews = getInterviewsForDay(day)
            const isToday = new Date().getDate() === day &&
              new Date().getMonth() === month &&
              new Date().getFullYear() === year

            return (
              <div key={day}
                className={'h-24 border border-gray-100 rounded-lg p-1 cursor-pointer hover:border-blue-300 transition-colors ' + (isToday ? 'border-blue-400 bg-blue-50' : 'bg-gray-50')}
                onClick={() => setSelected(dayInterviews.length > 0 ? { day, interviews: dayInterviews } : null)}
              >
                <p className={'text-xs font-medium mb-1 ' + (isToday ? 'text-blue-600' : 'text-gray-600')}>
                  {day}
                </p>
                <div className="space-y-0.5">
                  {dayInterviews.slice(0, 2).map(i => (
                    <div key={i._id}
                      className={'text-xs text-white px-1 rounded truncate ' + (statusColors[i.status] || 'bg-blue-400')}>
                      {i.candidate?.name || 'Interview'}
                    </div>
                  ))}
                  {dayInterviews.length > 2 && (
                    <p className="text-xs text-gray-400">+{dayInterviews.length - 2} more</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex gap-4 mt-4 pt-4 border-t border-gray-100">
          {Object.entries(statusColors).map(([status, color]) => (
            <div key={status} className="flex items-center gap-1.5">
              <div className={'w-3 h-3 rounded-full ' + color} />
              <span className="text-xs text-gray-500">{status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Day detail popup */}
      {selected && (
        <div className="mt-4 bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-medium text-gray-700">
              Interviews on {monthName.split(' ')[0]} {selected.day}
            </h3>
            <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-sm">
              Close ✕
            </button>
          </div>
          <div className="space-y-3">
            {selected.interviews.map(i => (
              <div key={i._id} className="border border-gray-100 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{i.candidate?.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{i.candidate?.position}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {i.time} · {i.mode} · Interviewer: {i.interviewer}
                    </p>
                  </div>
                  <span className={'text-xs font-medium px-2 py-1 rounded-full ' + (
                    i.status === 'Completed' ? 'bg-green-100 text-green-700' :
                    i.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  )}>{i.status}</span>
                </div>
                {i.feedback && <p className="text-xs text-gray-500 mt-2 bg-gray-50 rounded p-2">{i.feedback}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Calendar
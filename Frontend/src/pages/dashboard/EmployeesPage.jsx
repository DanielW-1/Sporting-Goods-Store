import React, { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import { formatDate, getRoleLabel } from '../../lib/utils'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const EmployeesPage = () => {
  const [tab, setTab] = useState('staff')
  const [staff, setStaff] = useState([])
  const [schedules, setSchedules] = useState([])
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [scheduleForm, setScheduleForm] = useState({ staff_id: '', day_of_week: 1, start_time: '09:00', end_time: '17:00' })

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [staffData, scheduleData, attendanceData] = await Promise.all([
        api.get('/admin/users'),
        api.get('/schedules'),
        api.get('/attendance'),
      ])
      setStaff((staffData || []).filter(u => u.role !== 'customer'))
      setSchedules(scheduleData || [])
      setAttendance(attendanceData || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddSchedule = async (e) => {
    e.preventDefault()
    try {
      await api.post('/schedules', { ...scheduleForm, day_of_week: Number(scheduleForm.day_of_week) })
      setShowScheduleModal(false)
      setScheduleForm({ staff_id: '', day_of_week: 1, start_time: '09:00', end_time: '17:00' })
      const data = await api.get('/schedules')
      setSchedules(data || [])
    } catch (err) {
      alert(err.message)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Employees</h1>

      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {['staff', 'schedules', 'attendance'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-semibold capitalize border-b-2 transition ${tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'staff' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Role</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Joined</th>
              </tr>
            </thead>
            <tbody>
              {staff.map(u => (
                <tr key={u.id} className="border-t border-gray-200">
                  <td className="px-4 py-3 font-medium">{u.first_name} {u.last_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                      {getRoleLabel(u.role)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatDate(u.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'schedules' && (
        <>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowScheduleModal(true)}
              className="bg-orange-600 text-white px-4 py-2 rounded font-semibold text-sm"
            >
              + Add Schedule
            </button>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Employee</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Day</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Start</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">End</th>
                </tr>
              </thead>
              <tbody>
                {schedules.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">No schedules</td></tr>
                ) : schedules.map(s => (
                  <tr key={s.id} className="border-t border-gray-200">
                    <td className="px-4 py-3 font-medium">{s.profiles?.first_name} {s.profiles?.last_name}</td>
                    <td className="px-4 py-3 text-sm">{DAYS[s.day_of_week]}</td>
                    <td className="px-4 py-3 text-sm">{s.start_time}</td>
                    <td className="px-4 py-3 text-sm">{s.end_time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'attendance' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Employee</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Clock In</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Clock Out</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No attendance records</td></tr>
              ) : attendance.map(a => (
                <tr key={a.id} className="border-t border-gray-200">
                  <td className="px-4 py-3 font-medium">{a.profiles?.first_name} {a.profiles?.last_name}</td>
                  <td className="px-4 py-3 text-sm">{formatDate(a.date)}</td>
                  <td className="px-4 py-3 text-sm">{a.clock_in ? new Date(a.clock_in).toLocaleTimeString() : '—'}</td>
                  <td className="px-4 py-3 text-sm">{a.clock_out ? new Date(a.clock_out).toLocaleTimeString() : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${a.status === 'present' ? 'bg-green-100 text-green-800' : a.status === 'absent' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Add Schedule</h2>
            <form onSubmit={handleAddSchedule} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Employee</label>
                <select
                  value={scheduleForm.staff_id}
                  onChange={e => setScheduleForm({ ...scheduleForm, staff_id: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  required
                >
                  <option value="">Select employee</option>
                  {staff.map(u => (
                    <option key={u.id} value={u.id}>{u.first_name} {u.last_name} ({getRoleLabel(u.role)})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Day</label>
                <select
                  value={scheduleForm.day_of_week}
                  onChange={e => setScheduleForm({ ...scheduleForm, day_of_week: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                >
                  {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Time</label>
                  <input type="time" value={scheduleForm.start_time} onChange={e => setScheduleForm({ ...scheduleForm, start_time: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Time</label>
                  <input type="time" value={scheduleForm.end_time} onChange={e => setScheduleForm({ ...scheduleForm, end_time: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" required />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-semibold">Add</button>
                <button type="button" onClick={() => setShowScheduleModal(false)} className="border border-gray-300 px-4 py-2 rounded text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default EmployeesPage

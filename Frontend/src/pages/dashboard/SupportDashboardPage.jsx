import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import { formatDate } from '../../lib/utils'

const statusColors = {
  open: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
}

const SupportDashboardPage = () => {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    fetchTickets()
  }, [statusFilter])

  const fetchTickets = async () => {
    setLoading(true)
    try {
      const params = statusFilter ? `?status=${statusFilter}` : ''
      const data = await api.get(`/support/tickets${params}`)
      setTickets(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const counts = tickets.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1
    return acc
  }, {})

  if (loading) return <LoadingSpinner />

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Support Dashboard</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {['open', 'in_progress', 'resolved', 'closed'].map(s => (
          <div key={s} className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold">{counts[s] || 0}</p>
            <p className="text-sm text-gray-500 capitalize">{s.replace('_', ' ')}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3 mb-4">
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 text-sm"
        >
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">Ticket</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Subject</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Created</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {tickets.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No tickets found</td></tr>
            ) : tickets.map(ticket => (
              <tr key={ticket.id} className="border-t border-gray-200">
                <td className="px-4 py-3 text-sm font-mono text-gray-500">#{ticket.id.slice(0, 8)}</td>
                <td className="px-4 py-3 font-medium text-sm">{ticket.subject}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[ticket.status] || 'bg-gray-100 text-gray-800'}`}>
                    {ticket.status?.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{formatDate(ticket.created_at)}</td>
                <td className="px-4 py-3">
                  <Link to={`/support/tickets/${ticket.id}`} className="text-blue-600 text-sm hover:text-orange-600">
                    View →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default SupportDashboardPage

import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import LoadingSpinner from '../components/LoadingSpinner'
import { formatDate } from '../lib/utils'

const SupportPage = () => {
  const { user, isRole } = useAuth()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNewTicket, setShowNewTicket] = useState(false)
  const [newTicket, setNewTicket] = useState({ subject: '', message: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true)
      try {
        const data = await api.get('/support/tickets')
        setTickets(data)
      } catch (error) {
        console.error('Error fetching tickets:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchTickets()
  }, [])

  const handleCreateTicket = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const ticket = await api.post('/support/tickets', newTicket)
      setTickets([ticket, ...tickets])
      setShowNewTicket(false)
      setNewTicket({ subject: '', message: '' })
    } catch (error) {
      alert(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-green-100 text-green-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-gray-100 text-gray-800',
      closed: 'bg-gray-100 text-gray-500',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Support Tickets</h1>
        <button
          onClick={() => setShowNewTicket(true)}
          className="bg-orange-600 text-white px-4 py-2 rounded font-semibold hover:bg-orange-700"
        >
          New Ticket
        </button>
      </div>

      {/* New Ticket Form */}
      {showNewTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Create Support Ticket</h2>
            <form onSubmit={handleCreateTicket}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Subject</label>
                <input
                  type="text"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea
                  value={newTicket.message}
                  onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                  className="input-field"
                  rows="4"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-navy-800 disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Ticket'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewTicket(false)}
                  className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {tickets.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg border border-gray-200">
          <div className="text-6xl mb-4">🎫</div>
          <h3 className="text-xl font-semibold mb-2">No support tickets</h3>
          <p className="text-gray-500">Create a ticket to get help from our support team.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map(ticket => (
            <Link
              key={ticket.id}
              to={`/support/tickets/${ticket.id}`}
              className="bg-white rounded-lg p-4 border border-gray-200 block hover:shadow-md transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{ticket.subject}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Created {formatDate(ticket.created_at)}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(ticket.status)}`}>
                  {ticket.status}
                </span>
              </div>
              {ticket.assigned_to_name && (
                <p className="text-xs text-gray-400 mt-2">Assigned to: {ticket.assigned_to_name}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default SupportPage
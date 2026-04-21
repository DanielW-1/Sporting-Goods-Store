import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import LoadingSpinner from '../components/LoadingSpinner'
import { formatDate } from '../lib/utils'

const SupportTicketPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, profile, isRole } = useAuth()
  const [ticket, setTicket] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    const fetchTicket = async () => {
      setLoading(true)
      try {
        const data = await api.get(`/support/tickets/${id}`)
        setTicket(data)
        setMessages(data.chat_messages || [])
      } catch (error) {
        console.error('Error fetching ticket:', error)
        navigate('/support')
      } finally {
        setLoading(false)
      }
    }
    fetchTicket()
  }, [id, navigate])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || sending) return

    setSending(true)
    try {
      const message = await api.post(`/support/tickets/${id}/messages`, { message: newMessage })
      setMessages([...messages, message])
      setNewMessage('')
    } catch (error) {
      alert(error.message)
    } finally {
      setSending(false)
    }
  }

  const handleUpdateStatus = async (status) => {
    try {
      await api.put(`/support/tickets/${id}/status`, { status })
      setTicket({ ...ticket, status })
    } catch (error) {
      alert(error.message)
    }
  }

  const handleAssign = async () => {
    try {
      await api.put(`/support/tickets/${id}/assign`, { assigned_to: profile.id })
      setTicket({ ...ticket, assigned_to: profile.id, assigned_to_name: `${profile.first_name} ${profile.last_name}` })
    } catch (error) {
      alert(error.message)
    }
  }

  if (loading) return <LoadingSpinner />

  const canManage = isRole(['support_staff', 'manager', 'admin'])

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 p-4 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl font-bold">{ticket.subject}</h1>
              <p className="text-sm text-gray-500 mt-1">
                Created {formatDate(ticket.created_at)} · Ticket #{ticket.id.slice(0, 8)}
              </p>
            </div>
            <div className="flex gap-2">
              {canManage && ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                <>
                  <button
                    onClick={() => handleUpdateStatus('in_progress')}
                    className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded"
                  >
                    Mark In Progress
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('resolved')}
                    className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded"
                  >
                    Resolve
                  </button>
                </>
              )}
              {canManage && !ticket.assigned_to && (
                <button
                  onClick={handleAssign}
                  className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                >
                  Assign to Me
                </button>
              )}
            </div>
          </div>
          <div className="mt-2">
            <span className={`px-2 py-1 rounded text-xs font-semibold ${
              ticket.status === 'open' ? 'bg-green-100 text-green-800' :
              ticket.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {ticket.status}
            </span>
            {ticket.assigned_to_name && (
              <span className="ml-2 text-xs text-gray-500">Assigned to: {ticket.assigned_to_name}</span>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="h-96 overflow-y-auto p-4 bg-gray-50">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-20">No messages yet</div>
          ) : (
            messages.map(msg => (
              <div
                key={msg.id}
                className={`mb-4 flex ${msg.sender_id === profile?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] p-3 rounded-lg ${
                  msg.sender_id === profile?.id
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-white border border-gray-200 text-gray-700 rounded-bl-none'
                }`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold">
                      {msg.sender_id === profile?.id ? 'You' : msg.sender_name || 'Support Agent'}
                    </span>
                    <span className="text-[10px] opacity-70 ml-2">
                      {formatDate(msg.created_at)}
                    </span>
                  </div>
                  <p className="text-sm">{msg.message}</p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-navy-800 transition disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SupportTicketPage
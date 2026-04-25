import React, { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import { formatDate, getRoleLabel } from '../../lib/utils'

const ROLES = ['customer', 'staff', 'inventory_staff', 'support_staff', 'driver', 'manager', 'admin']

const AdminPage = () => {
  const [tab, setTab] = useState('users')
  const [users, setUsers] = useState([])
  const [policies, setPolicies] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingPolicy, setEditingPolicy] = useState(null)
  const [policyValue, setPolicyValue] = useState('')
  const [changingRole, setChangingRole] = useState(null)

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [usersData, policiesData] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/policies'),
      ])
      setUsers(usersData || [])
      setPolicies(policiesData || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId, newRole) => {
    setChangingRole(userId)
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole })
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
    } catch (err) {
      alert(err.message)
    } finally {
      setChangingRole(null)
    }
  }

  const handlePolicySave = async () => {
    try {
      await api.put(`/admin/policies/${editingPolicy.key}`, { value: policyValue })
      setPolicies(prev => prev.map(p => p.key === editingPolicy.key ? { ...p, value: policyValue } : p))
      setEditingPolicy(null)
    } catch (err) {
      alert(err.message)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>

      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {['users', 'policies'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-semibold capitalize border-b-2 transition ${tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'users' && (
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
              {users.map(u => (
                <tr key={u.id} className="border-t border-gray-200">
                  <td className="px-4 py-3 font-medium">{u.first_name} {u.last_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      onChange={e => handleRoleChange(u.id, e.target.value)}
                      disabled={changingRole === u.id}
                      className="border border-gray-300 rounded px-2 py-1 text-xs disabled:opacity-50"
                    >
                      {ROLES.map(r => <option key={r} value={r}>{getRoleLabel(r)}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatDate(u.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'policies' && (
        <div className="space-y-3">
          {policies.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No policies found</p>
          ) : policies.map(policy => (
            <div key={policy.key} className="bg-white rounded-lg border border-gray-200 p-4 flex justify-between items-start gap-4">
              <div className="flex-1">
                <p className="font-semibold text-sm">{policy.key}</p>
                <p className="text-gray-600 text-sm mt-1">{policy.value}</p>
                {policy.updated_at && (
                  <p className="text-xs text-gray-400 mt-1">Updated {formatDate(policy.updated_at)}</p>
                )}
              </div>
              <button
                onClick={() => { setEditingPolicy(policy); setPolicyValue(policy.value) }}
                className="text-blue-600 text-sm shrink-0"
              >
                Edit
              </button>
            </div>
          ))}
        </div>
      )}

      {editingPolicy && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <h2 className="text-xl font-bold mb-1">Edit Policy</h2>
            <p className="text-sm text-gray-500 mb-4">{editingPolicy.key}</p>
            <textarea
              value={policyValue}
              onChange={e => setPolicyValue(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              rows={4}
            />
            <div className="flex gap-3 mt-4">
              <button onClick={handlePolicySave} className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-semibold">Save</button>
              <button onClick={() => setEditingPolicy(null)} className="border border-gray-300 px-4 py-2 rounded text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPage

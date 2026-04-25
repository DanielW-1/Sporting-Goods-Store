import React, { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import LoadingSpinner from '../../components/LoadingSpinner'

const SuppliersPage = () => {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ company_name: '', phone: '', email: '' })

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const fetchSuppliers = async () => {
    setLoading(true)
    try {
      const data = await api.get('/suppliers')
      setSuppliers(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const openAdd = () => {
    setEditing(null)
    setForm({ company_name: '', phone: '', email: '' })
    setShowModal(true)
  }

  const openEdit = (supplier) => {
    setEditing(supplier)
    setForm({ company_name: supplier.company_name, phone: supplier.phone || '', email: supplier.email || '' })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        await api.put(`/suppliers/${editing.id}`, form)
      } else {
        await api.post('/suppliers', form)
      }
      setShowModal(false)
      fetchSuppliers()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleDeactivate = async (supplier) => {
    if (!confirm(`Deactivate ${supplier.company_name}?`)) return
    try {
      await api.delete(`/suppliers/${supplier.id}`)
      fetchSuppliers()
    } catch (err) {
      alert(err.message)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Suppliers</h1>
        <button onClick={openAdd} className="bg-orange-600 text-white px-4 py-2 rounded font-semibold">
          + Add Supplier
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">Company</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Phone</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No suppliers yet</td></tr>
            ) : suppliers.map(s => (
              <tr key={s.id} className="border-t border-gray-200">
                <td className="px-4 py-3 font-medium">{s.company_name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{s.email || '—'}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{s.phone || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${s.status === 'active' || !s.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {s.status || 'active'}
                  </span>
                </td>
                <td className="px-4 py-3 flex gap-3">
                  <button onClick={() => openEdit(s)} className="text-blue-600 text-sm">Edit</button>
                  {(s.status === 'active' || !s.status) && (
                    <button onClick={() => handleDeactivate(s)} className="text-red-600 text-sm">Deactivate</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">{editing ? 'Edit Supplier' : 'Add Supplier'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Company Name *</label>
                <input
                  type="text"
                  value={form.company_name}
                  onChange={e => setForm({ ...form, company_name: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-semibold">
                  {editing ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="border border-gray-300 px-4 py-2 rounded text-sm">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default SuppliersPage

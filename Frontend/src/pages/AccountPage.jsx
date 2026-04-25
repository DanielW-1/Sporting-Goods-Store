import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'

const AccountPage = () => {
  const { profile, updateProfile, updatePassword, logout } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
    date_of_birth: profile?.date_of_birth || '',
    gender: profile?.gender || '',
  })
  const [passwordData, setPasswordData] = useState({
    new_password: '',
    confirm_password: '',
  })
  const [passwordError, setPasswordError] = useState('')

  const handleSave = async () => {
    setLoading(true)
    try {
      await updateProfile(formData)
      setIsEditing(false)
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordError('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      await updatePassword(passwordData.new_password)
      setIsChangingPassword(false)
      setPasswordData({ new_password: '', confirm_password: '' })
      alert('Password updated successfully')
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!profile) return <LoadingSpinner />

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Account</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="text-center">
            <div className="w-20 h-20 bg-navy-800 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white text-2xl font-bold">
                {profile.first_name?.[0]}{profile.last_name?.[0]}
              </span>
            </div>
            <h3 className="font-semibold">{profile.first_name} {profile.last_name}</h3>
            <p className="text-sm text-gray-500">{profile.email}</p>
            <p className="text-xs text-gray-400 mt-1 capitalize">Role: {profile.role}</p>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500">Reward Points</span>
              <span className="font-bold text-blue-600">{profile.reward_points || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Discount Points</span>
              <span className="font-bold text-orange-600">{profile.discount_points || 0}</span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={logout}
              className="w-full border border-red-300 text-red-600 py-2 text-sm font-semibold rounded hover:bg-red-50 transition"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Personal Information</h3>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-blue-600 text-sm hover:text-orange-600"
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">First Name</label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Last Name</label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.date_of_birth?.split('T')[0] || ''}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-orange-600 text-white px-6 py-2 font-semibold rounded hover:bg-orange-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div><span className="text-gray-500 text-sm">First Name</span><p className="font-medium">{profile.first_name}</p></div>
                  <div><span className="text-gray-500 text-sm">Last Name</span><p className="font-medium">{profile.last_name}</p></div>
                </div>
                <div><span className="text-gray-500 text-sm">Email</span><p className="font-medium">{profile.email}</p></div>
                <div><span className="text-gray-500 text-sm">Phone</span><p className="font-medium">{profile.phone || 'Not provided'}</p></div>
                <div><span className="text-gray-500 text-sm">Address</span><p className="font-medium">{profile.address || 'Not provided'}</p></div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Change Password</h3>
              <button
                onClick={() => setIsChangingPassword(!isChangingPassword)}
                className="text-blue-600 text-sm hover:text-orange-600"
              >
                {isChangingPassword ? 'Cancel' : 'Change'}
              </button>
            </div>

            {isChangingPassword && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">New Password</label>
                  <input
                    type="password"
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Confirm Password</label>
                  <input
                    type="password"
                    value={passwordData.confirm_password}
                    onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                    className="input-field"
                  />
                </div>
                {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
                <button
                  onClick={handlePasswordChange}
                  disabled={loading}
                  className="bg-orange-600 text-white px-6 py-2 font-semibold rounded hover:bg-orange-700 disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountPage
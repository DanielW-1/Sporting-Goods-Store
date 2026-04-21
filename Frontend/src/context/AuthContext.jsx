import React, { createContext, useState, useContext, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { api } from '../lib/api'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async (userId) => {
    try {
      const data = await api.get('/profile')
      setProfile(data)
      return data
    } catch (error) {
      console.error('Error fetching profile:', error)
      return null
    }
  }, [])

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true)
      
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        setUser(session.user)
        await fetchProfile(session.user.id)
      }
      
      setLoading(false)
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
          await fetchProfile(session.user.id)
        } else {
          setUser(null)
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  const login = async (email, password) => {
    const result = await api.post('/auth/login', { email, password })
    if (result.user) {
      setProfile(result.user)
      setUser({ id: result.user.id, email: result.user.email })
    }
    return result
  }

  const register = async (userData) => {
    const result = await api.post('/auth/register', userData)
    return result
  }

  const logout = async () => {
    await api.post('/auth/logout')
    setUser(null)
    setProfile(null)
  }

  const updateProfile = async (data) => {
    const updated = await api.put('/profile', data)
    setProfile(updated)
    return updated
  }

  const updatePassword = async (newPassword) => {
    return await api.put('/auth/update-password', { new_password: newPassword })
  }

  const isRole = (roles) => {
    if (!profile) return false
    if (typeof roles === 'string') return profile.role === roles
    return roles.includes(profile.role)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        login,
        register,
        logout,
        updateProfile,
        updatePassword,
        isRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
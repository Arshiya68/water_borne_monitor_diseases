import { createContext, useState, useEffect } from 'react'
import api from '../services/api'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('access_token')
    if (token) {
      fetchUser(token)
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUser = async (token) => {
    try {
      const response = await api.get('/auth/me')
      setUser(response.data)
    } catch (error) {
      console.error('Failed to fetch user:', error)
      localStorage.removeItem('access_token')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', {
        email: email.toLowerCase().trim(),
        password,
      })

      const token = response.data.access_token
      localStorage.setItem('access_token', token)
      setUser(response.data.user)
      return response.data
    } catch (error) {
      throw error
    }
  }

  const register = async (formData) => {
    try {
      const response = await api.post('/auth/register', {
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        phone: formData.phone.replace(/\D/g, ''),
        password: formData.password,
        role: formData.role,
        village: formData.village,
        district: formData.district,
        state: formData.state,
        age: formData.age ? parseInt(formData.age) : null,
        gender: formData.gender,
        prefer_sms: formData.prefer_sms,
        prefer_email: formData.prefer_email,
      })
      return response.data
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
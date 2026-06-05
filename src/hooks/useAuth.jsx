import { createContext, useContext, useState, useEffect } from 'react'
import { auth } from '../lib/base44'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(() => auth.currentUser())
  const [loading, setLoading] = useState(false)

  // Refresh user from localStorage on mount
  useEffect(() => {
    const u = auth.currentUser()
    setUser(u)
  }, [])

  const login = async (email, password) => {
    setLoading(true)
    try {
      const u = await auth.login(email, password)
      setUser(u)
      return u
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    await auth.logout()
    setUser(null)
  }

  const isAdmin = user?.is_admin === true

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

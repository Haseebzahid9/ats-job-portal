import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getProfile } from '../services/auth_service'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('token') || null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch the profile when a token is available on mount
  useEffect(() => {
    const fetchProfile = async () => {
      const storedToken = localStorage.getItem('token')
      if (!storedToken) {
        setIsLoading(false)
        return
      }
      try {
        const response = await getProfile()
        setUser(response.data?.user || response.data)
      } catch {
        // Invalid / expired token — clear everything
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setToken(null)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [])

  /**
   * Call after a successful login response
   * @param {Object} userData  - user object from server
   * @param {string} authToken - JWT string from server
   */
  const login = useCallback((userData, authToken) => {
    localStorage.setItem('token', authToken)
    localStorage.setItem('user', JSON.stringify(userData))
    setToken(authToken)
    setUser(userData)
  }, [])

  /**
   * Log the current user out
   */
  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }, [])

  /**
   * Refresh the user object from the server (e.g. after profile update)
   */
  const refreshUser = useCallback(async () => {
    try {
      const response = await getProfile()
      const updated = response.data?.user || response.data
      setUser(updated)
      localStorage.setItem('user', JSON.stringify(updated))
    } catch {
      // silently ignore
    }
  }, [])

  const isAuthenticated = Boolean(token && user)

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Hook to consume the Auth context
 */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>')
  }
  return ctx
}

export default AuthContext

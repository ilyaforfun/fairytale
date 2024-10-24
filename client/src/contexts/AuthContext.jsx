import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  // Handle OAuth redirect
  useEffect(() => {
    const handleAuthRedirect = async () => {
      try {
        // Check if we have a hash in the URL (OAuth redirect)
        const hash = window.location.hash
        if (hash) {
          console.log('Detected OAuth redirect with hash:', hash)
          const { data: { session }, error } = await supabase.auth.getSession()
          
          if (error) {
            console.error('Error getting session after OAuth redirect:', error)
            setError('Failed to complete authentication. Please try again.')
            throw error
          }

          if (session) {
            console.log('Successfully retrieved session after OAuth redirect')
            setUser(session.user)
            navigate('/')
          }
        }
      } catch (error) {
        console.error('Error handling OAuth redirect:', error)
        setError('Authentication failed. Please try again.')
      }
    }

    handleAuthRedirect()
  }, [navigate])

  // Listen for auth state changes
  useEffect(() => {
    console.log('Setting up auth state listener')
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting initial session:', error)
        setError(error.message)
      } else {
        console.log('Initial session retrieved:', session ? 'Session exists' : 'No session')
        setUser(session?.user ?? null)
      }
      setLoading(false)
    })

    // Listen for changes in auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session ? 'Session exists' : 'No session')
      setUser(session?.user ?? null)
      setLoading(false)

      // Handle specific auth events
      switch (event) {
        case 'SIGNED_IN':
          console.log('User signed in:', session?.user?.email)
          navigate('/')
          break
        case 'SIGNED_OUT':
          console.log('User signed out')
          navigate('/auth')
          break
        case 'TOKEN_REFRESHED':
          console.log('Session token refreshed')
          break
        case 'USER_UPDATED':
          console.log('User data updated')
          break
        case 'USER_DELETED':
          console.log('User account deleted')
          navigate('/auth')
          break
        case 'ERROR':
          console.error('Auth error occurred:', session)
          setError('An authentication error occurred')
          break
      }
    })

    return () => {
      console.log('Cleaning up auth state listener')
      subscription.unsubscribe()
    }
  }, [navigate])

  const signUp = async (email, password, fullName) => {
    try {
      console.log('Attempting to sign up user:', email)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      })
      
      if (error) throw error
      console.log('User signed up successfully:', data)
      return data
    } catch (error) {
      console.error('Sign up error:', error)
      setError(error.message)
      throw error
    }
  }

  const signIn = async (email, password) => {
    try {
      console.log('Attempting to sign in user:', email)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      console.log('User signed in successfully:', data)
      return data
    } catch (error) {
      console.error('Sign in error:', error)
      setError(error.message)
      throw error
    }
  }

  const signInWithGoogle = async () => {
    try {
      console.log('Initiating Google sign-in')
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      })
      
      if (error) throw error
      console.log('Google sign-in initiated:', data)
      return data
    } catch (error) {
      console.error('Google sign-in error:', error)
      setError(error.message)
      throw error
    }
  }

  const signOut = async () => {
    try {
      console.log('Attempting to sign out user')
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      console.log('User signed out successfully')
    } catch (error) {
      console.error('Sign out error:', error)
      setError(error.message)
      throw error
    }
  }

  const clearError = () => {
    setError(null)
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      clearError
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

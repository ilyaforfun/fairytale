import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [authRedirectInProgress, setAuthRedirectInProgress] = useState(false)
  const navigate = useNavigate()

  // Handle OAuth redirect
  useEffect(() => {
    const handleAuthRedirect = async () => {
      try {
        const hash = window.location.hash
        if (hash) {
          console.log('Detected OAuth redirect with hash', { pathname: window.location.pathname, origin: window.location.origin })
          setAuthRedirectInProgress(true)
          setLoading(true)

          const { data: { session }, error: sessionError } = await supabase.auth.getSession()
          
          if (sessionError) {
            console.error('Error getting session after OAuth redirect:', sessionError)
            setError('Failed to complete authentication. Please try again.')
            throw sessionError
          }

          if (session) {
            console.log('Successfully retrieved session:', {
              provider: session.user?.app_metadata?.provider,
              email: session.user?.email,
              id: session.user?.id
            })
            setUser(session.user)
            setError(null)
            navigate('/', { replace: true })
          } else {
            console.error('No session found after OAuth redirect')
            setError('Authentication failed. Please try again.')
            navigate('/auth', { replace: true })
          }
        }
      } catch (error) {
        console.error('Error handling OAuth redirect:', error)
        setError('Authentication failed. Please try again.')
        navigate('/auth', { replace: true })
      } finally {
        setAuthRedirectInProgress(false)
        setLoading(false)
      }
    }

    handleAuthRedirect()
  }, [navigate])

  // Listen for auth state changes
  useEffect(() => {
    console.log('Setting up auth state listener')
    
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting initial session:', error)
          setError(error.message)
        } else {
          console.log('Initial session retrieved:', {
            exists: !!session,
            provider: session?.user?.app_metadata?.provider,
            email: session?.user?.email
          })
          setUser(session?.user ?? null)
        }
      } catch (error) {
        console.error('Error during auth initialization:', error)
        setError('Failed to initialize authentication')
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', {
        event,
        sessionExists: !!session,
        provider: session?.user?.app_metadata?.provider
      })

      setUser(session?.user ?? null)
      
      switch (event) {
        case 'SIGNED_IN':
          console.log('User signed in successfully:', {
            email: session?.user?.email,
            provider: session?.user?.app_metadata?.provider
          })
          if (!authRedirectInProgress) {
            navigate('/')
          }
          break
          
        case 'SIGNED_OUT':
          console.log('User signed out')
          navigate('/auth')
          break
          
        case 'TOKEN_REFRESHED':
          console.log('Session token refreshed')
          break
          
        case 'USER_UPDATED':
          console.log('User data updated:', {
            email: session?.user?.email,
            provider: session?.user?.app_metadata?.provider
          })
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
  }, [navigate, authRedirectInProgress])

  // Add signIn function
  const signIn = async (email, password) => {
    try {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      
      console.log('Sign in successful:', {
        email: data.user?.email,
        id: data.user?.id
      })
      
      return data
    } catch (error) {
      console.error('Sign in error:', error)
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Add signUp function
  const signUp = async (email, password, name) => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name
          }
        }
      })
      
      if (error) throw error
      
      console.log('Sign up successful:', {
        email: data.user?.email,
        id: data.user?.id
      })
      
      return data
    } catch (error) {
      console.error('Sign up error:', error)
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    try {
      console.log('Initiating Google sign-in')
      setLoading(true)
      setError(null)

      const redirectUrl = `${window.location.origin}/auth`
      console.log('Using redirect URL:', redirectUrl)

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      })
      
      if (error) throw error

      console.log('Google sign-in initiated successfully:', {
        provider: data?.provider,
        url: data?.url
      })
      
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
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      console.log('User signed out successfully')
      setUser(null)
    } catch (error) {
      console.error('Sign out error:', error)
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
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
      signIn,
      signUp,
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

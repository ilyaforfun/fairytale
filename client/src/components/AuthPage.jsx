import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs"
import { BookOpen, Wand2, Sparkles, Mail, Lock, User, AlertCircle } from 'lucide-react'
import { Separator } from "../components/ui/separator"
import { Alert, AlertDescription } from "../components/ui/alert"
import { useAuth } from '../contexts/AuthContext'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('AuthPage Error:', error)
    console.error('ErrorInfo:', errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 py-12 px-4 flex items-center justify-center">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Something went wrong loading the authentication page. Please try refreshing the page.
              {this.state.error && <div className="mt-2 text-xs">{this.state.error.toString()}</div>}
            </AlertDescription>
          </Alert>
        </div>
      )
    }
    return this.props.children
  }
}

export default function AuthPage() {
  console.log('Rendering AuthPage component') // Debug log
  const navigate = useNavigate()
  const { signIn, signUp, signInWithGoogle, error: authError } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    console.log('AuthPage mounted') // Component lifecycle log
    return () => console.log('AuthPage unmounted')
  }, [])

  const handleSignIn = async (event) => {
    event.preventDefault()
    console.log('Attempting sign in') // Debug log
    setError('')
    setIsLoading(true)
    try {
      await signIn(email, password)
      console.log('Sign in successful')
    } catch (error) {
      console.error('Sign in error:', error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (event) => {
    event.preventDefault()
    console.log('Attempting sign up') // Debug log
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)
    try {
      await signUp(email, password, name)
      console.log('Sign up successful')
    } catch (error) {
      console.error('Sign up error:', error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    console.log('Attempting Google sign in') // Debug log
    setIsGoogleLoading(true)
    try {
      await signInWithGoogle()
      console.log('Google sign in initiated')
    } catch (error) {
      console.error('Google sign in error:', error)
      setError(error.message)
    } finally {
      setIsGoogleLoading(false)
    }
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm shadow-xl rounded-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-purple-800 flex items-center justify-center">
              <BookOpen className="mr-2 h-8 w-8" />
              Fairytale Realm
            </CardTitle>
            <CardDescription className="text-purple-600">
              Enter a world of magic and wonder
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-purple-100 p-1 rounded-xl">
                <TabsTrigger value="signin" className="data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-md rounded-lg px-3 py-2 text-sm font-medium text-purple-600 transition-all duration-200">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-md rounded-lg px-3 py-2 text-sm font-medium text-purple-600 transition-all duration-200">
                  Sign Up
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <div className="bg-white mt-4 p-6 rounded-xl shadow-sm">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <div className="relative">
                        <Input
                          id="signin-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email"
                          required
                          className="pl-10 border-2 border-purple-300 focus:border-purple-500 rounded-xl"
                        />
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500 h-5 w-5" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="signin-password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                          required
                          className="pl-10 border-2 border-purple-300 focus:border-purple-500 rounded-xl"
                        />
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500 h-5 w-5" />
                      </div>
                    </div>
                    {(error || authError) && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error || authError}</AlertDescription>
                      </Alert>
                    )}
                    <Button 
                      type="submit" 
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Wand2 className="mr-2 h-4 w-4 animate-spin" />
                          Casting Spell...
                        </>
                      ) : (
                        <>
                          <Wand2 className="mr-2 h-4 w-4" />
                          Enter the Realm
                        </>
                      )}
                    </Button>
                    <div className="mt-4">
                      <Separator className="my-4" />
                      <Button
                        onClick={handleGoogleSignIn}
                        type="button"
                        className="w-full bg-white hover:bg-gray-100 text-gray-900 border border-gray-300 rounded-xl"
                        disabled={isGoogleLoading}
                      >
                        {isGoogleLoading ? (
                          <>
                            <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Connecting...
                          </>
                        ) : (
                          <>
                            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                              <path
                                fill="currentColor"
                                d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                              />
                            </svg>
                            Sign in with Google
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </div>
              </TabsContent>
              
              <TabsContent value="signup">
                <div className="bg-white mt-4 p-6 rounded-xl shadow-sm">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <div className="relative">
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Enter your full name"
                          required
                          className="pl-10 border-2 border-purple-300 focus:border-purple-500 rounded-xl"
                        />
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500 h-5 w-5" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <div className="relative">
                        <Input
                          id="signup-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email"
                          required
                          className="pl-10 border-2 border-purple-300 focus:border-purple-500 rounded-xl"
                        />
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500 h-5 w-5" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="signup-password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Create a password"
                          required
                          className="pl-10 border-2 border-purple-300 focus:border-purple-500 rounded-xl"
                        />
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500 h-5 w-5" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <div className="relative">
                        <Input
                          id="confirm-password"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm your password"
                          required
                          className="pl-10 border-2 border-purple-300 focus:border-purple-500 rounded-xl"
                        />
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500 h-5 w-5" />
                      </div>
                    </div>
                    {(error || authError) && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error || authError}</AlertDescription>
                      </Alert>
                    )}
                    <Button 
                      type="submit" 
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                          Creating Magic...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Join the Adventure
                        </>
                      )}
                    </Button>
                    <div className="mt-4">
                      <Separator className="my-4" />
                      <Button
                        onClick={handleGoogleSignIn}
                        type="button"
                        className="w-full bg-white hover:bg-gray-100 text-gray-900 border border-gray-300 rounded-xl"
                        disabled={isGoogleLoading}
                      >
                        {isGoogleLoading ? (
                          <>
                            <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Connecting...
                          </>
                        ) : (
                          <>
                            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                              <path
                                fill="currentColor"
                                d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                              />
                            </svg>
                            Sign up with Google
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  )
}
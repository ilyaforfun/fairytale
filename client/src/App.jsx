import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { useAuth } from './contexts/AuthContext'
import AuthPage from './components/AuthPage'
import MainMenu from './MainMenu'
import FairytalePage from './FairytalePage'
import StoryLibrary from './components/StoryLibrary'

// Protected Route wrapper component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
          <p className="mt-2 text-purple-600">Loading your magical journey...</p>
        </div>
      </div>
    )
  }
  
  if (!user) {
    return <Navigate to="/auth" />
  }

  return children
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/" element={
            <ProtectedRoute>
              <MainMenu />
            </ProtectedRoute>
          } />
          <Route path="/create-story" element={
            <ProtectedRoute>
              <FairytalePage />
            </ProtectedRoute>
          } />
          <Route path="/library" element={
            <ProtectedRoute>
              <StoryLibrary />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 flex items-center justify-center">
                <div className="bg-white p-6 rounded-lg shadow-xl">
                  <h1 className="text-2xl font-bold text-purple-800 mb-4">Settings</h1>
                  <p className="text-gray-600">Coming Soon!</p>
                </div>
              </div>
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App

import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { useAuth } from './contexts/AuthContext'
import AuthPage from './components/AuthPage'
import MainMenu from './MainMenu'
import FairytalePage from './FairytalePage'

// Protected Route wrapper component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <div>Loading...</div>
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
          {/* Add these routes later when implementing the features */}
          <Route path="/library" element={
            <ProtectedRoute>
              <div>Library Page (Coming Soon)</div>
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <div>Settings Page (Coming Soon)</div>
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App

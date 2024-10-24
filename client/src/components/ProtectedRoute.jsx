import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading, error } = useAuth()

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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
          <h2 className="text-xl font-bold text-red-600 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.href = '/auth'}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
          >
            Return to Login
          </button>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  return children
}

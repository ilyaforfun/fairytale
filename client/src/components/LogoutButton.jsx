import React from 'react'
import { Button } from "@/components/ui/button"
import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function LogoutButton() {
  const navigate = useNavigate()
  const { signOut } = useAuth()

  const handleLogout = async () => {
    try {
      await signOut()
      navigate('/auth')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <Button
      variant="outline"
      className="bg-white text-purple-600 hover:bg-purple-100 hover:text-purple-700 border-purple-300 rounded-xl" // Changed to rounded-xl
      onClick={handleLogout}
    >
      <LogOut className="mr-2 h-4 w-4" />
      Sign Out
    </Button>
  )
}
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function LogoutButton() {
  const navigate = useNavigate()
  const { signOut } = useAuth()

  const handleLogout = async () => {
    try {
      await signOut()
      navigate('/auth')
    } catch (error) {
      console.error('Failed to log out:', error)
    }
  }

  return (
    <Button
      onClick={handleLogout}
      variant="outline"
      className="flex items-center gap-2 bg-white hover:bg-gray-100"
    >
      <LogOut className="h-4 w-4" />
      Logout
    </Button>
  )
}

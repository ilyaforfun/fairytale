import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PlusCircle, Library, Settings, LogOut } from 'lucide-react'
import { useAuth } from './contexts/AuthContext'

export default function MainMenu() {
  const navigate = useNavigate()
  const { signOut } = useAuth()

  const handleLogout = async () => {
    try {
      await signOut()
      navigate('/auth')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white shadow-2xl rounded-xl overflow-hidden">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-purple-800 text-center mb-6">Fairytale Creator</h2>
          
          <div className="space-y-4">
            <Button 
              variant="outline"
              className="w-full bg-white hover:bg-purple-50 text-purple-600 border-2 border-purple-600 flex items-center justify-center py-4 rounded-xl shadow-sm transition-all duration-200"
              onClick={() => navigate('/create-story')}
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Create New Story
            </Button>
            
            <Button 
              variant="outline"
              className="w-full bg-white hover:bg-purple-50 text-purple-600 border-2 border-purple-600 flex items-center justify-center py-4 rounded-xl shadow-sm transition-all duration-200"
              onClick={() => navigate('/library')}
            >
              <Library className="w-5 h-5 mr-2" />
              Story Library
            </Button>
            
            <Button 
              variant="outline"
              className="w-full bg-white hover:bg-purple-50 text-purple-600 border-2 border-purple-600 flex items-center justify-center py-4 rounded-xl shadow-sm transition-all duration-200"
              onClick={() => navigate('/settings')}
            >
              <Settings className="w-5 h-5 mr-2" />
              Settings
            </Button>

            <Button 
              variant="outline"
              className="w-full bg-white hover:bg-purple-50 text-purple-600 border-2 border-purple-600 flex items-center justify-center py-4 rounded-xl shadow-sm transition-all duration-200"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5 mr-2" />
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

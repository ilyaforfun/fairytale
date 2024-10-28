import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Trash2 } from 'lucide-react'

export default function SavedStories({ onStorySelect }) {
  const { user } = useAuth()
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user) {
      fetchUserStories()
    }
  }, [user])

  const fetchUserStories = async () => {
    try {
      const response = await fetch(`/api/user-stories/${user.id}`)
      if (!response.ok) throw new Error('Failed to fetch stories')
      const data = await response.json()
      setStories(data)
    } catch (error) {
      console.error('Error fetching stories:', error)
      setError('Failed to load your stories')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteStory = async (storyId) => {
    try {
      const response = await fetch(`/api/story/${storyId}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete story')
      setStories(stories.filter(story => story.id !== storyId))
    } catch (error) {
      console.error('Error deleting story:', error)
      setError('Failed to delete story')
    }
  }

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
        <p className="mt-2 text-purple-600">Loading your magical stories...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-600 text-center py-4">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-purple-800 mb-4">Your Magical Collection</h2>
      {stories.length === 0 ? (
        <Card>
          <CardContent className="text-center py-6">
            <p className="text-purple-600">No stories saved yet. Create your first magical tale!</p>
          </CardContent>
        </Card>
      ) : (
        stories.map((story) => (
          <Card key={story.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl text-purple-800">{story.title}</CardTitle>
                  <CardDescription>
                    Created for {story.child_name} ({story.child_age} years old)
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onStorySelect(story)}
                    className="text-purple-600 hover:text-purple-700"
                  >
                    <BookOpen className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteStory(story.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Theme: {story.theme}</p>
              <p className="text-sm text-gray-500 mt-2">
                Created on {new Date(story.created_at).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}

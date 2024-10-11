import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Wand2, Palette, Send, Crown, Rocket, Waves, Leaf, Volume2 } from 'lucide-react'

export default function FairytalePage() {
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [theme, setTheme] = useState('')
  const [bookType, setBookType] = useState('pictured')
  const [loading, setLoading] = useState(false)
  const [story, setStory] = useState(null)
  const [error, setError] = useState(null)
  const [showPrompts, setShowPrompts] = useState(false)
  const [prompts, setPrompts] = useState({ storyPrompt: '' })
  const [currentStage, setCurrentStage] = useState(0)
  const [audioUrl, setAudioUrl] = useState(null)
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false)
  const [audioError, setAudioError] = useState(null)

  // ... (keep other parts of your component like themes, bookTypes, etc.)

  const handleGenerateSpeech = async () => {
    setIsGeneratingAudio(true)
    setAudioError(null)
    try {
      console.log('Generating speech for story:', story.content)
      const response = await fetch('/api/generate-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: story.content,
          fileName: `${name}_fairytale.mp3`,
        }),
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      console.log('Speech generation response:', data)
      setAudioUrl(data.audioUrl)
    } catch (error) {
      console.error('Error generating speech:', error)
      setAudioError(`Failed to generate speech: ${error.message}`)
    } finally {
      setIsGeneratingAudio(false)
    }
  }

  const handleAudioError = (e) => {
    console.error('Audio playback error:', e)
    setAudioError(`Failed to play audio: ${e.message}`)
  }

  // ... (keep other functions like handleSubmit, handleContinueStory, etc.)

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-xl bg-white">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-purple-800">Magical Fairytale Generator</CardTitle>
            <CardDescription className="text-center text-purple-600">Create your personalized fairytale adventure</CardDescription>
          </CardHeader>
          <CardContent>
            {/* ... (keep existing content) */}
            {story && (
              <div className="mt-6">
                {/* ... (keep existing story display) */}
                <div className="mt-4 flex justify-between">
                  <Button
                    onClick={togglePrompts}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    {showPrompts ? "Hide Prompts" : "Show Prompts"}
                  </Button>
                  <Button
                    onClick={handleGenerateSpeech}
                    className="bg-green-500 hover:bg-green-600 text-white"
                    disabled={isGeneratingAudio}
                  >
                    {isGeneratingAudio ? "Generating..." : "Generate Speech"}
                    <Volume2 className="ml-2 h-5 w-5" />
                  </Button>
                </div>
                {audioUrl && (
                  <div className="mt-4">
                    <audio
                      controls
                      src={audioUrl}
                      className="w-full"
                      onError={handleAudioError}
                    >
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                )}
                {audioError && (
                  <div className="mt-2 text-red-600">{audioError}</div>
                )}
                {/* ... (keep existing prompts display) */}
              </div>
            )}
          </CardContent>
        </Card>
        {/* ... (keep "How It Works" section) */}
      </div>
    </div>
  )
}

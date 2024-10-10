import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Wand2, Palette, Send, Crown, Rocket, Waves, Leaf, Download } from 'lucide-react'

export default function FairytalePage() {
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [theme, setTheme] = useState('')
  const [bookType, setBookType] = useState('pictured')
  const [loading, setLoading] = useState(false)
  const [story, setStory] = useState(null)
  const [error, setError] = useState(null)
  const [showPrompts, setShowPrompts] = useState(false)
  const [prompts, setPrompts] = useState({ storyPrompt: '', imagePrompt: '' })
  const [currentStage, setCurrentStage] = useState(0)
  const [imageUrl1, setImageUrl1] = useState(null)
  const [imageUrl2, setImageUrl2] = useState(null)
  const [pdfLoading, setPdfLoading] = useState(false)

  const themes = [
    { value: 'princess', label: 'Princess Adventure', icon: Crown },
    { value: 'space', label: 'Space Exploration', icon: Rocket },
    { value: 'underwater', label: 'Underwater Journey', icon: Waves },
    { value: 'forest', label: 'Enchanted Forest', icon: Leaf },
  ]

  const bookTypes = [
    { value: 'pictured', label: 'Pictured Fairy Tale' },
    { value: 'coloring', label: 'Coloring Book' },
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setStory(null)
    setImageUrl1(null)
    setImageUrl2(null)

    try {
      const response = await fetch('/api/initialize-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ childName: name, childAge: age, childInterests: theme, bookType }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || 'Failed to generate story')
      }

      const data = await response.json()
      console.log('Received story data:', data)
      setStory({
        title: data.title,
        content: data.content,
        choices: data.choices,
        imagePrompt: data.imagePrompt,
      })
      setCurrentStage(1)
      fetchPrompts()
      const imageUrl = await generateImage(data.imagePrompt)
      setImageUrl1(imageUrl)
    } catch (error) {
      console.error('Error generating story:', error)
      setError(error.message || 'An error occurred while generating the story. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleContinueStory = async (choice) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/continue-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ choice, childName: name }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || 'Failed to continue story')
      }

      const data = await response.json()
      console.log('Received continuation data:', data)
      setStory(prevStory => ({
        ...prevStory,
        content: prevStory.content + '\n\n' + choice + '\n\n' + data.content,
        choices: null,
        imagePrompt: data.imagePrompt,
      }))
      setCurrentStage(2)
      fetchPrompts()
      const imageUrl = await generateImage(data.imagePrompt)
      setImageUrl2(imageUrl)
    } catch (error) {
      console.error('Error continuing story:', error)
      setError(error.message || 'An error occurred while continuing the story. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const generateImage = async (imagePrompt) => {
    try {
      console.log('Generating image with prompt:', imagePrompt)
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imagePrompt, isColoringBook: bookType === 'coloring' }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || 'Failed to generate image')
      }

      const data = await response.json()
      console.log('Received image URL:', data.imageUrl)
      return data.imageUrl
    } catch (error) {
      console.error('Error generating image:', error)
      setError(error.message || 'An error occurred while generating the image. Please try again.')
    }
  }

  const fetchPrompts = async () => {
    try {
      const response = await fetch('/api/prompts')
      if (!response.ok) {
        throw new Error('Failed to fetch prompts')
      }
      const data = await response.json()
      setPrompts(data)
    } catch (error) {
      console.error('Error fetching prompts:', error)
    }
  }

  const togglePrompts = () => {
    setShowPrompts(!showPrompts)
  }

  const handleSavePDF = async () => {
    if (!story) return;

    setPdfLoading(true);
    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ story, imageUrl1, imageUrl2 }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const data = await response.json();
      const pdfUrl = data.pdfUrl;

      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `${story.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF. Please try again.');
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-xl bg-white">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-purple-800">Magical Fairytale Generator</CardTitle>
            <CardDescription className="text-center text-purple-600">Create your personalized fairytale adventure</CardDescription>
          </CardHeader>
          <CardContent>
            {!story && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Child's Name</Label>
                  <Input 
                    id="name" 
                    placeholder="Enter the child's name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="border-2 border-purple-300 focus:border-purple-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Child's Age</Label>
                  <Input 
                    id="age" 
                    type="number" 
                    placeholder="Enter the child's age" 
                    value={age} 
                    onChange={(e) => setAge(e.target.value)}
                    required
                    min="1"
                    max="12"
                    className="border-2 border-purple-300 focus:border-purple-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fairytale Theme</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {themes.map((item) => {
                      const Icon = item.icon
                      const isSelected = theme === item.value
                      return (
                        <Button
                          key={item.value}
                          type="button"
                          variant={isSelected ? "default" : "outline"}
                          className={`h-auto flex flex-col items-center justify-center p-4 transition-all duration-200 ${
                            isSelected 
                              ? 'bg-purple-600 text-white shadow-lg scale-105 border-4 border-yellow-400' 
                              : 'hover:bg-purple-100 hover:scale-102'
                          }`}
                          onClick={() => setTheme(item.value)}
                        >
                          <Icon className={`h-8 w-8 mb-2 ${isSelected ? 'text-yellow-400' : 'text-purple-600'}`} />
                          <span className="text-sm font-medium">{item.label}</span>
                          {isSelected && (
                            <span className="absolute top-0 right-0 bg-yellow-400 text-purple-600 px-2 py-1 text-xs font-bold rounded-bl-lg">
                              Selected
                            </span>
                          )}
                        </Button>
                      )
                    })}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Book Type</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {bookTypes.map((item) => {
                      const isSelected = bookType === item.value
                      return (
                        <Button
                          key={item.value}
                          type="button"
                          variant={isSelected ? "default" : "outline"}
                          className={`h-auto flex items-center justify-center p-4 transition-all duration-200 ${
                            isSelected 
                              ? 'bg-purple-600 text-white font-bold' 
                              : 'bg-white text-purple-600 hover:bg-purple-100'
                          }`}
                          onClick={() => setBookType(item.value)}
                        >
                          <span className="text-sm">{item.label}</span>
                        </Button>
                      )
                    })}
                  </div>
                </div>
                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white" disabled={loading}>
                  {loading ? 'Generating...' : 'Generate Fairytale'}
                  <Wand2 className="ml-2 h-5 w-5" />
                </Button>
              </form>
            )}
            {error && (
              <div className="mt-4 text-red-600 text-center">{error}</div>
            )}
            {story && (
              <div className="mt-6">
                <h3 className="text-xl font-semibold text-purple-800">{story.title}</h3>
                <p className="mt-2 text-gray-700 whitespace-pre-wrap">{story.content}</p>
                <div className="mt-4 text-purple-800 font-semibold">
                  Stage: {currentStage} / 2
                </div>
                {story.choices && currentStage === 1 && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-purple-800">What happens next?</h4>
                    <div className="grid grid-cols-1 gap-2 mt-2">
                      <Button
                        onClick={() => handleContinueStory(story.choices.A)}
                        className="bg-purple-500 hover:bg-purple-600 text-white"
                        disabled={loading}
                      >
                        {story.choices.A}
                      </Button>
                      <Button
                        onClick={() => handleContinueStory(story.choices.B)}
                        className="bg-purple-500 hover:bg-purple-600 text-white"
                        disabled={loading}
                      >
                        {story.choices.B}
                      </Button>
                    </div>
                  </div>
                )}
                {imageUrl1 && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-purple-800">Story Illustration 1</h4>
                    <img src={imageUrl1} alt="Story Illustration 1" className="mt-2 rounded-lg shadow-md" />
                  </div>
                )}
                {imageUrl2 && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-purple-800">Story Illustration 2</h4>
                    <img src={imageUrl2} alt="Story Illustration 2" className="mt-2 rounded-lg shadow-md" />
                  </div>
                )}
                {currentStage === 2 && (
                  <div className="mt-4 text-green-600 font-semibold">
                    Story Complete!
                  </div>
                )}
                <div className="mt-4 flex justify-between">
                  <Button onClick={togglePrompts} className="bg-blue-500 hover:bg-blue-600 text-white">
                    {showPrompts ? 'Hide Prompts' : 'Show Prompts'}
                  </Button>
                  <Button
                    onClick={handleSavePDF}
                    className="bg-green-500 hover:bg-green-600 text-white"
                    disabled={pdfLoading || currentStage !== 2}
                  >
                    {pdfLoading ? 'Generating PDF...' : 'Save as PDF'}
                    <Download className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}
            {showPrompts && (
              <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                <h4 className="font-semibold text-purple-800">Story Generation Prompt:</h4>
                <p className="text-sm text-gray-700">{prompts.storyPrompt}</p>
                <h4 className="font-semibold text-purple-800 mt-2">Image Generation Prompt:</h4>
                <p className="text-sm text-gray-700">{prompts.imagePrompt}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 space-y-6">
          <h2 className="text-xl font-semibold text-purple-800 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white/50 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <BookOpen className="mx-auto h-8 w-8 text-purple-600 mb-2" />
                <h3 className="font-medium text-purple-800">1. Enter Details</h3>
                <p className="text-sm text-purple-600">Provide the child's name and age</p>
              </CardContent>
            </Card>
            <Card className="bg-white/50 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <Palette className="mx-auto h-8 w-8 text-purple-600 mb-2" />
                <h3 className="font-medium text-purple-800">2. Choose Theme</h3>
                <p className="text-sm text-purple-600">Select a magical theme for the story</p>
              </CardContent>
            </Card>
            <Card className="bg-white/50 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <Send className="mx-auto h-8 w-8 text-purple-600 mb-2" />
                <h3 className="font-medium text-purple-800">3. Generate</h3>
                <p className="text-sm text-purple-600">Create a unique fairytale adventure</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
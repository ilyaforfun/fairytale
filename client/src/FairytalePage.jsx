import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Wand2, Palette, Send, Crown, Rocket, Waves, Leaf, Download } from 'lucide-react'
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Image } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
  },
  section: {
    margin: 10,
    padding: 10,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  text: {
    fontSize: 12,
    marginBottom: 10,
  },
  image: {
    maxWidth: '100%',
    maxHeight: '300px',
    objectFit: 'contain',
    marginVertical: 15,
  },
});

const FairytalePDF = ({ story, imageUrl, secondImageUrl }) => {
  const splitContent = (content) => {
    const paragraphs = content.split('\n\n');
    const midpoint = Math.ceil(paragraphs.length / 2);
    return [
      paragraphs.slice(0, midpoint).join('\n\n'),
      paragraphs.slice(midpoint).join('\n\n')
    ];
  };

  const [firstHalf, secondHalf] = splitContent(story.content);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.title}>{story.title}</Text>
          <Text style={styles.text}>{firstHalf}</Text>
          {imageUrl && <Image src={imageUrl} style={styles.image} />}
        </View>
      </Page>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.text}>{secondHalf}</Text>
          {secondImageUrl && <Image src={secondImageUrl} style={styles.image} />}
        </View>
      </Page>
    </Document>
  );
};

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
  const [imageUrl, setImageUrl] = useState(null)
  const [secondImageUrl, setSecondImageUrl] = useState(null)

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
    setImageUrl(null)
    setSecondImageUrl(null)

    console.log('Form submitted with:', { name, age, theme, bookType })

    try {
      const response = await fetch('/api/initialize-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ childName: name, childAge: age, childInterests: theme, bookType }),
      })

      console.log('Response status:', response.status)

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
      generateImage(data.imagePrompt)
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
      generateImage(data.imagePrompt, true)
    } catch (error) {
      console.error('Error continuing story:', error)
      setError(error.message || 'An error occurred while continuing the story. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const generateImage = async (imagePrompt, isSecondImage = false) => {
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
      if (isSecondImage) {
        setSecondImageUrl(data.imageUrl)
      } else {
        setImageUrl(data.imageUrl)
      }
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

  const splitStoryContent = (content) => {
    return content.split('\n\n').filter(paragraph => paragraph.trim() !== '');
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-xl bg-white">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-purple-800">Magical Fairytale Generator</CardTitle>
            <CardDescription className="text-center text-purple-600 text-lg">Create your personalized fairytale adventure</CardDescription>
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
                <h3 className="text-2xl font-semibold text-purple-800 mb-4">{story.title}</h3>
                {splitStoryContent(story.content).map((paragraph, index) => (
                  <div key={index} className="mb-4">
                    <div className="prose prose-sm max-w-none">
                      <p className="text-gray-700 whitespace-pre-wrap">{paragraph}</p>
                    </div>
                    {index === 0 && imageUrl && (
                      <div className="mt-4">
                        <img src={imageUrl} alt="First Story Illustration" className="w-full rounded-lg shadow-md" />
                      </div>
                    )}
                    {index === splitStoryContent(story.content).length - 1 && secondImageUrl && (
                      <div className="mt-4">
                        <img src={secondImageUrl} alt="Second Story Illustration" className="w-full rounded-lg shadow-md" />
                      </div>
                    )}
                  </div>
                ))}
                <div className="mt-4 text-purple-800 font-semibold">
                  Stage: {currentStage} / 2
                </div>
                {story.choices && currentStage === 1 && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-purple-800 mb-2">What happens next?</h4>
                    <div className="grid grid-cols-1 gap-2">
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
                {currentStage === 2 && (
                  <div className="mt-4 text-green-600 font-semibold text-center">
                    Story Complete!
                  </div>
                )}
                {currentStage === 2 && (
                  <div className="mt-4 flex justify-center">
                    <PDFDownloadLink
                      document={<FairytalePDF story={story} imageUrl={imageUrl} secondImageUrl={secondImageUrl} />}
                      fileName={`${story.title.replace(/\s+/g, '_')}.pdf`}
                    >
                      {({ blob, url, loading, error }) => (
                        <Button
                          className="bg-green-500 hover:bg-green-600 text-white"
                          disabled={loading}
                        >
                          {loading ? 'Generating PDF...' : 'Download PDF'}
                          <Download className="ml-2 h-5 w-5" />
                        </Button>
                      )}
                    </PDFDownloadLink>
                  </div>
                )}
                <Button onClick={togglePrompts} className="mt-4 bg-blue-500 hover:bg-blue-600 text-white">
                  {showPrompts ? 'Hide Prompts' : 'Show Prompts'}
                </Button>
                {showPrompts && (
                  <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                    <h4 className="font-semibold text-purple-800">Story Generation Prompt:</h4>
                    <p className="text-sm text-gray-700">{prompts.storyPrompt}</p>
                    <h4 className="font-semibold text-purple-800 mt-2">Image Generation Prompt:</h4>
                    <p className="text-sm text-gray-700">{prompts.imagePrompt}</p>
                  </div>
                )}
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
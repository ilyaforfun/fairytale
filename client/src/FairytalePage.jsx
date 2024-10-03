import { useState } from 'react'
import { Button } from "./components/ui/button"
import { Input } from "./components/ui/input"
import { Label } from "./components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card"
import { BookOpen, Wand2, Palette, Send, Crown, Rocket, Waves, Tree } from 'lucide-react'

export default function FairytalePage() {
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [theme, setTheme] = useState('')
  const [bookType, setBookType] = useState('pictured')

  const themes = [
    { value: 'princess', label: 'Princess Adventure', icon: Crown },
    { value: 'space', label: 'Space Exploration', icon: Rocket },
    { value: 'underwater', label: 'Underwater Journey', icon: Waves },
    { value: 'forest', label: 'Enchanted Forest', icon: Tree },
  ]

  const bookTypes = [
    { value: 'pictured', label: 'Pictured Fairy Tale' },
    { value: 'coloring', label: 'Coloring Book' },
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission here
    console.log('Submitted:', { name, age, theme, bookType })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-purple-800">Fairytale Generator</CardTitle>
            <CardDescription className="text-center text-purple-600">Create your personalized fairytale adventure</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Child's Name</Label>
                <Input 
                  id="name" 
                  placeholder="Enter the child's name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  required
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
              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                Generate Fairytale
                <Wand2 className="ml-2 h-5 w-5" />
              </Button>
            </form>
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

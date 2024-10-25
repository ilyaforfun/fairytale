import React, { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Wand2, Palette, Send, Crown, Rocket, Waves, Leaf, Volume2 } from 'lucide-react'
import WaitingState from './components/WaitingState'
import CharacterCreator from './components/CharacterCreator'
import LogoutButton from './components/LogoutButton'

export default function FairytalePage() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [theme, setTheme] = useState("");
  const [bookType, setBookType] = useState("pictured");
  const [loading, setLoading] = useState(false);
  const [story, setStory] = useState(null);
  const [error, setError] = useState(null);
  const [showPrompts, setShowPrompts] = useState(false);
  const [prompts, setPrompts] = useState({ storyPrompt: "", imagePrompt: "" });
  const [currentStage, setCurrentStage] = useState(0);
  const [imageUrl, setImageUrl] = useState(null);
  const [secondImageUrl, setSecondImageUrl] = useState(null);
  const [firstAudioUrl, setFirstAudioUrl] = useState(null);
  const [secondAudioUrl, setSecondAudioUrl] = useState(null);
  const [isFirstAudioLoading, setIsFirstAudioLoading] = useState(false);
  const [isSecondAudioLoading, setIsSecondAudioLoading] = useState(false);
  const [firstAudioError, setFirstAudioError] = useState(null);
  const [secondAudioError, setSecondAudioError] = useState(null);
  const firstAudioRef = useRef(null);
  const secondAudioRef = useRef(null);
  const [userChoice, setUserChoice] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isImageGenerating, setIsImageGenerating] = useState(false);
  const [showCharacterCreator, setShowCharacterCreator] = useState(false);
  const [characterAttributes, setCharacterAttributes] = useState({});
  const [allAttributesSelected, setAllAttributesSelected] = useState(false);

  const themes = [
    { value: "princess", label: "Princess Adventure", icon: Crown },
    { value: "space", label: "Space Exploration", icon: Rocket },
    { value: "underwater", label: "Underwater Journey", icon: Waves },
    { value: "forest", label: "Enchanted Forest", icon: Leaf },
  ];

  const bookTypes = [
    { value: "pictured", label: "Pictured Fairy Tale" },
    { value: "coloring", label: "Coloring Book" },
  ];

  const handleCharacterAttributesChange = (attributes) => {
    setCharacterAttributes(attributes);
  };

  const handleAllAttributesSelected = (isSelected) => {
    setAllAttributesSelected(isSelected);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-4 right-4">
        <LogoutButton />
      </div>
      {(isGenerating || isImageGenerating) && <WaitingState />}
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-xl bg-white">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-purple-800">
              Magical Fairytale Generator
            </CardTitle>
            <CardDescription className="text-lg text-purple-600">
              Create your own magical story
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="childName">Child's Name</Label>
                <Input
                  id="childName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter the child's name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="childAge">Child's Age</Label>
                <Input
                  id="childAge"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Enter the child's age"
                  className="mt-1"
                  min="1"
                  max="12"
                />
              </div>
              <CharacterCreator 
                onAttributesChange={handleCharacterAttributesChange}
                onAllAttributesSelected={handleAllAttributesSelected}
              />
              <div>
                <Label>Choose a Theme</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  {themes.map((themeOption) => {
                    const Icon = themeOption.icon;
                    return (
                      <Button
                        key={themeOption.value}
                        variant={theme === themeOption.value ? "default" : "outline"}
                        className={`flex items-center justify-center gap-2 ${
                          theme === themeOption.value
                            ? "bg-purple-600 hover:bg-purple-700"
                            : "hover:bg-purple-100"
                        }`}
                        onClick={() => setTheme(themeOption.value)}
                      >
                        <Icon className="h-4 w-4" />
                        {themeOption.label}
                      </Button>
                    );
                  })}
                </div>
              </div>
              <div>
                <Label>Book Type</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  {bookTypes.map((type) => (
                    <Button
                      key={type.value}
                      variant={bookType === type.value ? "default" : "outline"}
                      className={`flex items-center justify-center gap-2 ${
                        bookType === type.value
                          ? "bg-purple-600 hover:bg-purple-700"
                          : "hover:bg-purple-100"
                      }`}
                      onClick={() => setBookType(type.value)}
                    >
                      {type.value === "pictured" ? (
                        <BookOpen className="h-4 w-4" />
                      ) : (
                        <Palette className="h-4 w-4" />
                      )}
                      {type.label}
                    </Button>
                  ))}
                </div>
              </div>
              <Button
                className="w-full bg-purple-600 hover:bg-purple-700 text-white mt-6"
                disabled={!name || !age || !theme || !allAttributesSelected}
              >
                <Wand2 className="h-4 w-4 mr-2" />
                Generate Fairytale
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

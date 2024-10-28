import React, { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Wand2, Palette, Send, Crown, Rocket, Waves, Leaf, Volume2, LogOut } from 'lucide-react'
import WaitingState from './components/WaitingState'
import CharacterCreator from './components/CharacterCreator'
import { useAuth } from './contexts/AuthContext'

export default function FairytalePage() {
  const { signOut } = useAuth()
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [interests, setInterests] = useState("");
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

  const handleCharacterAttributes = (attributes) => {
    setCharacterAttributes(attributes);
  };

  const handleAllAttributesSelected = (isComplete) => {
    setAllAttributesSelected(isComplete);
  };

  const handleGenerateFairytale = async () => {
    if (!name || !age || !interests || !allAttributesSelected) {
      setError("Please fill in all fields and complete character creation");
      return;
    }
    setIsGenerating(true);
    // API call logic would go here
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 py-12 px-4 sm:px-6 lg:px-8">
      {(isGenerating || isImageGenerating) && <WaitingState />}
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-end mb-4">
          <Button
            onClick={signOut}
            className="bg-purple-600 hover:bg-purple-700 text-white transition-colors duration-200 flex items-center gap-2 px-4 py-2 rounded-lg shadow-md hover:shadow-lg"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
        <Card className="shadow-xl bg-white">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-purple-800">
              Magical Fairytale Generator
            </CardTitle>
            <CardDescription className="text-center text-purple-600 text-lg">
              Create your personalized fairytale adventure
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
                  placeholder="Enter child's name"
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
                  placeholder="Enter child's age"
                  min="1"
                  max="12"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="interests">Child's Interests (comma-separated)</Label>
                <Input
                  id="interests"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  placeholder="e.g., dragons, princesses, space"
                  className="mt-1"
                />
              </div>
              <div className="space-y-2">
                <Label>Book Type</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    type="button"
                    variant={bookType === "pictured" ? "default" : "outline"}
                    onClick={() => setBookType("pictured")}
                    className="flex items-center justify-center gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    Picture Book
                  </Button>
                  <Button
                    type="button"
                    variant={bookType === "coloring" ? "default" : "outline"}
                    onClick={() => setBookType("coloring")}
                    className="flex items-center justify-center gap-2"
                  >
                    <Palette className="w-4 h-4" />
                    Coloring Book
                  </Button>
                </div>
              </div>
              <CharacterCreator
                onAttributesChange={handleCharacterAttributes}
                onAllAttributesSelected={handleAllAttributesSelected}
              />
              {error && (
                <div className="text-red-600 text-sm mt-2">
                  {error}
                </div>
              )}
              <Button
                onClick={handleGenerateFairytale}
                disabled={!name || !age || !interests || !allAttributesSelected || isGenerating}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white mt-6"
              >
                {isGenerating ? (
                  <>
                    <Wand2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Your Fairytale...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate Fairytale
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

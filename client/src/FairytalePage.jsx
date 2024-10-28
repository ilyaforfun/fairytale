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
          {/* Rest of the existing content remains unchanged */}
        </Card>
      </div>
    </div>
  );
}

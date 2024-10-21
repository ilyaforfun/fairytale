import React, { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Wand2, Palette, Send, Crown, Rocket, Waves, Leaf, Volume2 } from 'lucide-react'
import WaitingState from './components/WaitingState'
import CharacterCreator from './components/CharacterCreator'

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
  const [attributeError, setAttributeError] = useState("");
  const [allAttributesSelected, setAllAttributesSelected] = useState(false)

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!showCharacterCreator) {
      setShowCharacterCreator(true);
      return;
    }

    if (!allAttributesSelected) {
      setAttributeError("Please select all character attributes before generating the story.");
      return;
    }

    setAttributeError("");
    setIsGenerating(true);
    setError(null);
    setStory(null);
    setImageUrl(null);
    setSecondImageUrl(null);

    try {
      const response = await fetch('/api/initialize-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          childName: name, 
          childAge: age, 
          childInterests: theme, 
          bookType,
          characterAttributes 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate story');
      }

      const data = await response.json();
      setStory(data);
      setCurrentStage(1);

      setIsImageGenerating(true);
      const imageResponse = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imagePrompt: data.imagePrompt, isColoringBook: bookType === 'coloring' }),
      });

      if (!imageResponse.ok) {
        throw new Error('Failed to generate image');
      }

      const imageData = await imageResponse.json();
      setImageUrl(imageData.imageUrl);
      setIsImageGenerating(false);

      const promptsResponse = await fetch('/api/prompts');
      const promptsData = await promptsResponse.json();
      setPrompts(promptsData);
    } catch (error) {
      console.error('Error:', error);
      setError('Oops! Something went wrong. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleContinueStory = async (choice) => {
    setIsGenerating(true);
    setError(null);
    setUserChoice(choice);

    try {
      const response = await fetch('/api/continue-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ choice, childName: name }),
      });

      if (!response.ok) {
        throw new Error('Failed to continue story');
      }

      const data = await response.json();
      setStory(prevStory => ({
        ...prevStory,
        content: prevStory.content + '\n\n' + choice + '\n\n' + data.content,
        choices: null,
        imagePrompt: data.imagePrompt,
      }));
      setCurrentStage(2);

      setIsImageGenerating(true);
      const imageResponse = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imagePrompt: data.imagePrompt, isColoringBook: bookType === 'coloring' }),
      });

      if (!imageResponse.ok) {
        throw new Error('Failed to generate second image');
      }

      const imageData = await imageResponse.json();
      setSecondImageUrl(imageData.imageUrl);
      setIsImageGenerating(false);

      const promptsResponse = await fetch('/api/prompts');
      const promptsData = await promptsResponse.json();
      setPrompts(promptsData);
    } catch (error) {
      console.error('Error:', error);
      setError('Oops! Something went wrong. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePrompts = () => {
    setShowPrompts(!showPrompts);
  };

  const splitStoryContent = (content) => {
    return content.split("\n\n").filter((paragraph) => paragraph.trim() !== "");
  };

  const resetStory = () => {
    setName("");
    setAge("");
    setTheme("");
    setBookType("pictured");
    setStory(null);
    setError(null);
    setShowPrompts(false);
    setPrompts({ storyPrompt: "", imagePrompt: "" });
    setCurrentStage(0);
    setImageUrl(null);
    setSecondImageUrl(null);
    setFirstAudioUrl(null);
    setSecondAudioUrl(null);
    setShowCharacterCreator(false);
    setCharacterAttributes({});
  };

  const handleGenerateFirstSpeech = async () => {
    if (!story) return;

    setIsFirstAudioLoading(true);
    setFirstAudioError(null);
    try {
      const response = await fetch("/api/generate-speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: `${story.title}\n\n${story.content}\n\nOption A: ${story.choices.A}\n\nOption B: ${story.choices.B}`,
          fileName: `${name.toLowerCase().replace(/\s+/g, "_")}_fairytale_part1.mp3`,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate speech");
      }

      const data = await response.json();
      setFirstAudioUrl(data.audioUrl);
    } catch (error) {
      console.error("Error generating first speech:", error);
      setFirstAudioError(
        "Failed to generate speech for the first part. Please try again."
      );
    } finally {
      setIsFirstAudioLoading(false);
    }
  };

  const handleGenerateSecondSpeech = async () => {
    if (!story || currentStage !== 2 || !userChoice) return;

    setIsSecondAudioLoading(true);
    setSecondAudioError(null);
    try {
      const contentParts = story.content.split("\n\n");
      const choiceIndex = contentParts.findIndex(
        (part) => part.trim() === userChoice.trim()
      );

      if (choiceIndex === -1) {
        throw new Error("Unable to find user choice in story content");
      }

      const secondPartContent = contentParts
        .slice(choiceIndex + 1)
        .join("\n\n");

      const response = await fetch("/api/generate-speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: secondPartContent,
          fileName: `${name.toLowerCase().replace(/\s+/g, "_")}_fairytale_part2.mp3`,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate speech");
      }

      const data = await response.json();
      setSecondAudioUrl(data.audioUrl);
    } catch (error) {
      console.error("Error generating second speech:", error);
      setSecondAudioError(
        "Failed to generate speech for the second part. Please try again."
      );
    } finally {
      setIsSecondAudioLoading(false);
    }
  };

  useEffect(() => {
    if (firstAudioUrl && firstAudioRef.current) {
      const audio = firstAudioRef.current;
      audio.src = firstAudioUrl;
      audio.load();
    }
  }, [firstAudioUrl]);

  useEffect(() => {
    if (secondAudioUrl && secondAudioRef.current) {
      const audio = secondAudioRef.current;
      audio.src = secondAudioUrl;
      audio.load();
    }
  }, [secondAudioUrl]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 py-12 px-4 sm:px-6 lg:px-8">
      {(isGenerating || isImageGenerating) && <WaitingState />}
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-xl bg-white">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-purple-800">
              Magical Fairytale Generator
            </CardTitle>
            <CardDescription className="text-center text-purple-600 text-lg">
              Create your personalized fairytale adventure
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!story && (
              <form onSubmit={handleSubmit} className="space-y-6">
                {!showCharacterCreator ? (
                  <>
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
                          const Icon = item.icon;
                          const isSelected = theme === item.value;
                          return (
                            <Button
                              key={item.value}
                              type="button"
                              variant={isSelected ? "default" : "outline"}
                              className={`h-auto flex flex-col items-center justify-center p-4 transition-all duration-200 ${
                                isSelected
                                  ? "bg-purple-600 text-white shadow-lg scale-105 border-4 border-yellow-400"
                                  : "hover:bg-purple-100 hover:scale-102"
                              }`}
                              onClick={() => setTheme(item.value)}
                            >
                              <Icon
                                className={`h-8 w-8 mb-2 ${isSelected ? "text-yellow-400" : "text-purple-600"}`}
                              />
                              <span className="text-sm font-medium">
                                {item.label}
                              </span>
                              {isSelected && (
                                <span className="absolute top-0 right-0 bg-yellow-400 text-purple-600 px-2 py-1 text-xs font-bold rounded-bl-lg">
                                  Selected
                                </span>
                              )}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Book Type</Label>
                      <div className="grid grid-cols-2 gap-4">
                        {bookTypes.map((item) => {
                          const isSelected = bookType === item.value;
                          return (
                            <Button
                              key={item.value}
                              type="button"
                              variant={isSelected ? "default" : "outline"}
                              className={`h-auto flex items-center justify-center p-4 transition-all duration-200 ${
                                isSelected
                                  ? "bg-purple-600 text-white font-bold"
                                  : "bg-white text-purple-600 hover:bg-purple-100"
                              }`}
                              onClick={() => setBookType(item.value)}
                            >
                              <span className="text-sm">{item.label}</span>
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <CharacterCreator 
                      onAttributesChange={setCharacterAttributes}
                      onAllAttributesSelected={setAllAttributesSelected}
                    />
                    {attributeError && (
                      <div className="text-red-500 text-sm mt-2">{attributeError}</div>
                    )}
                  </>
                )}
                <Button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  disabled={isGenerating || (showCharacterCreator && !allAttributesSelected)}
                >
                  {isGenerating ? "Generating..." : showCharacterCreator ? "Generate Fairytale" : "Next: Create Character"}
                  <Wand2 className="ml-2 h-5 w-5" />
                </Button>
              </form>
            )}
            {error && (
              <div className="mt-4 text-red-600 text-center">{error}</div>
            )}
            {story && (
              <div className="mt-6">
                <h3 className="text-2xl font-semibold text-purple-800 mb-4">
                  {story.title}
                </h3>
                {splitStoryContent(story.content).map((paragraph, index) => (
                  <div key={index} className="mb-4">
                    <div className="prose prose-sm max-w-none">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {paragraph}
                      </p>
                    </div>
                    {index === 0 && imageUrl && (
                      <div className="mt-4">
                        <img
                          src={imageUrl}
                          alt="First Story Illustration"
                          className="w-full rounded-lg shadow-md"
                        />
                      </div>
                    )}
                    {index === splitStoryContent(story.content).length - 1 &&
                      secondImageUrl && (
                        <div className="mt-4">
                          <img
                            src={secondImageUrl}
                            alt="Second Story Illustration"
                            className="w-full rounded-lg shadow-md"
                          />
                        </div>
                      )}
                  </div>
                ))}
                <div className="mt-4 text-purple-800 font-semibold">
                  Stage: {currentStage} / 2
                </div>
                {story.choices && currentStage === 1 && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-purple-800 mb-2">
                      What happens next?
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      <Button
                        onClick={() => handleContinueStory(story.choices.A)}
                        className="bg-purple-500 hover:bg-purple-600 text-white"
                        disabled={isGenerating}
                      >
                        {story.choices.A}
                      </Button>
                      <Button
                        onClick={() => handleContinueStory(story.choices.B)}
                        className="bg-purple-500 hover:bg-purple-600 text-white"
                        disabled={isGenerating}
                      >
                        {story.choices.B}
                      </Button>
                    </div>
                  </div>
                )}
                {currentStage === 2 && (
                  <div className="mt-4 text-center">
                    <div className="text-green-600 font-semibold mb-4">
                      Story Complete!
                    </div>
                    <Button
                      onClick={resetStory}
                      className="bg-purple-500 hover:bg-purple-600 text-white"
                    >
                      Create New Story
                    </Button>
                  </div>
                )}
                <div className="mt-4 flex justify-between">
                  <Button
                    onClick={togglePrompts}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    {showPrompts ? "Hide Prompts" : "Show Prompts"}
                  </Button>
                  {currentStage === 1 && (
                    <Button
                      onClick={handleGenerateFirstSpeech}
                      className="bg-green-500 hover:bg-green-600 text-white"
                      disabled={isFirstAudioLoading}
                    >
                      {isFirstAudioLoading
                        ? "Generating..."
                        : "Generate First Part Speech"}
                      <Volume2 className="ml-2 h-5 w-5" />
                    </Button>
                  )}
                  {currentStage === 2 && (
                    <Button
                      onClick={handleGenerateSecondSpeech}
                      className="bg-green-500 hover:bg-green-600 text-white"
                      disabled={isSecondAudioLoading}
                    >
                      {isSecondAudioLoading
                        ? "Generating..."
                        : "Generate Second Part Speech"}
                      <Volume2 className="ml-2 h-5 w-5" />
                    </Button>
                  )}
                </div>
                {firstAudioUrl && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-purple-800 mb-2">
                      First Part Audio:
                    </h4>
                    <audio
                      ref={firstAudioRef}
                      controls
                      src={firstAudioUrl}
                      className="w-full"
                      onError={(e) => {
                        console.error("First audio error:", e.target.error);
                        setFirstAudioError(
                          `Error loading first audio: ${e.target.error.message}`
                        );
                      }}
                    >
                      Your browser does not support the audio element.
                    </audio>
                    {firstAudioError && (
                      <p className="text-red-500 mt-2">{firstAudioError}</p>
                    )}
                  </div>
                )}
                {secondAudioUrl && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-purple-800 mb-2">
                      Second Part Audio:
                    </h4>
                    <audio
                      ref={secondAudioRef}
                      controls
                      src={secondAudioUrl}
                      className="w-full"
                      onError={(e) => {
                        console.error("Second audio error:", e.target.error);
                        setSecondAudioError(
                          `Error loading second audio: ${e.target.error.message}`
                        );
                      }}
                    >
                      Your browser does not support the audio element.
                    </audio>
                    {secondAudioError && (
                      <p className="text-red-500 mt-2">{secondAudioError}</p>
                    )}
                  </div>
                )}
                {showPrompts && (
                  <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                    <h4 className="font-semibold text-purple-800">
                      Story Generation Prompt:
                    </h4>
                    <p className="text-sm text-gray-700">
                      {prompts.storyPrompt}
                    </p>
                    <h4 className="font-semibold text-purple-800 mt-2">
                      Image Generation Prompt:
                    </h4>
                    <p className="text-sm text-gray-700">
                      {prompts.imagePrompt}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 space-y-6">
          <h2 className="text-xl font-semibold text-purple-800 text-center">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white/50 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <BookOpen className="mx-auto h-8 w-8 text-purple-600 mb-2" />
                <h3 className="font-medium text-purple-800">
                  1. Enter Details
                </h3>
                <p className="text-sm text-purple-600">
                  Provide the child's name and age
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white/50 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <Palette className="mx-auto h-8 w-8 text-purple-600 mb-2" />
                <h3 className="font-medium text-purple-800">2. Choose Theme</h3>
                <p className="text-sm text-purple-600">
                  Select a magical theme for the story
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white/50 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <Send className="mx-auto h-8 w-8 text-purple-600 mb-2" />
                <h3 className="font-medium text-purple-800">3. Generate</h3>
                <p className="text-sm text-purple-600">
                  Create a unique fairytale adventure
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
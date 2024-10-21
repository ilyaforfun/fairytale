import React, { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Wand2, Palette, Send, Crown, Rocket, Waves, Leaf, Volume2 } from 'lucide-react'
import WaitingState from './components/WaitingState'
import CharacterCreator from './components/CharacterCreator'

export default function FairytalePage() {
  // ... (keep all existing state variables)

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

  // ... (keep all other functions)

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
                    {/* ... (keep existing input fields for name, age, theme, and book type) */}
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
            {/* ... (keep the rest of the component's JSX) */}
          </CardContent>
        </Card>
        {/* ... (keep the "How It Works" section) */}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from 'lucide-react'

const attributes = [
  { name: 'Gender', options: ['Boy', 'Girl'] },
  { name: 'Hair Style', options: ['Short', 'Long', 'Curly', 'Straight', 'Bald'] },
  { name: 'Hair Color', options: ['Black', 'Brown', 'Blonde', 'Red', 'Gray', 'White'] },
  { name: 'Skin Color', options: ['Light', 'Medium', 'Dark', 'Olive', 'Tan'] },
  { name: 'Eye Color', options: ['Brown', 'Blue', 'Green', 'Hazel', 'Gray'] },
]

export default function CharacterCreator({ onAttributesChange }) {
  const [currentAttributeIndex, setCurrentAttributeIndex] = useState(0)
  const [selections, setSelections] = useState({})

  const currentAttribute = attributes[currentAttributeIndex]
  const currentSelection = selections[currentAttribute.name] || 0

  useEffect(() => {
    onAttributesChange(selections)
  }, [selections, onAttributesChange])

  const handlePrevious = () => {
    setCurrentAttributeIndex((prev) => (prev > 0 ? prev - 1 : prev))
  }

  const handleNext = () => {
    setCurrentAttributeIndex((prev) => (prev < attributes.length - 1 ? prev + 1 : prev))
  }

  const handleLeftChoice = () => {
    setSelections((prev) => ({
      ...prev,
      [currentAttribute.name]: (prev[currentAttribute.name] - 1 + currentAttribute.options.length) % currentAttribute.options.length
    }))
  }

  const handleRightChoice = () => {
    setSelections((prev) => ({
      ...prev,
      [currentAttribute.name]: (prev[currentAttribute.name] + 1) % currentAttribute.options.length
    }))
  }

  const getCharacterSummary = () => {
    return attributes.map(attr => `${attr.name}: ${attr.options[selections[attr.name] || 0]}`).join(', ')
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-white shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-purple-800">Character Creator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            onClick={handlePrevious}
            disabled={currentAttributeIndex === 0}
            variant="outline"
            size="icon"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold text-purple-700">{currentAttribute.name}</h2>
          <Button
            onClick={handleNext}
            disabled={currentAttributeIndex === attributes.length - 1}
            variant="outline"
            size="icon"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center justify-between space-x-4">
          <Button
            onClick={handleLeftChoice}
            variant="outline"
            size="lg"
            className="w-1/3"
          >
            <ChevronLeft className="h-6 w-6 mr-2" />
            {currentAttribute.options[(currentSelection - 1 + currentAttribute.options.length) % currentAttribute.options.length]}
          </Button>
          <div className="text-center font-bold text-lg text-purple-600">
            {currentAttribute.options[currentSelection]}
          </div>
          <Button
            onClick={handleRightChoice}
            variant="outline"
            size="lg"
            className="w-1/3"
          >
            {currentAttribute.options[(currentSelection + 1) % currentAttribute.options.length]}
            <ChevronRight className="h-6 w-6 ml-2" />
          </Button>
        </div>
        <div className="mt-6 p-4 bg-purple-100 rounded-lg">
          <h3 className="font-semibold text-purple-800 mb-2">Character Summary</h3>
          <p className="text-sm text-purple-600">
            {getCharacterSummary()}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

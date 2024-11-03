import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Label } from '@radix-ui/react-label';

const attributes = [
  { name: 'Gender', options: ['Boy', 'Girl'] },
  { name: 'Hair Style', options: ['Short', 'Long', 'Curly', 'Straight', 'Bald'] },
  { name: 'Hair Color', options: ['Black', 'Brown', 'Blonde', 'Red', 'Gray', 'White'] },
  { name: 'Skin Color', options: ['Light', 'Medium', 'Dark', 'Olive', 'Tan'] },
  { name: 'Eye Color', options: ['Brown', 'Blue', 'Green', 'Hazel', 'Gray'] },
]

export default function CharacterCreator({ onAttributesChange, onAllAttributesSelected, onImageUploaded }) {
  const [currentAttributeIndex, setCurrentAttributeIndex] = useState(0)
  const [selections, setSelections] = useState({})
  const [uploadStatus, setUploadStatus] = useState({
    isUploading: false,
    error: null,
    success: false,
    fileName: null
  });

  const [hasUploadedImage, setHasUploadedImage] = useState(false);

  const currentAttribute = attributes[currentAttributeIndex]
  const currentSelection = selections[currentAttribute.name]

  useEffect(() => {
    onAttributesChange(selections)
    const allSelected = hasUploadedImage || attributes.every(attr => selections[attr.name]);
    onAllAttributesSelected(allSelected);
    console.log('Character attributes updated:', selections, 'All selected:', allSelected)
  }, [selections, hasUploadedImage]);

  const handlePrevious = () => {
    setCurrentAttributeIndex((prev) => (prev > 0 ? prev - 1 : prev))
  }

  const handleNext = () => {
    setCurrentAttributeIndex((prev) => (prev < attributes.length - 1 ? prev + 1 : prev))
  }

  const handleSelection = (option) => {
    setSelections((prev) => ({
      ...prev,
      [currentAttribute.name]: option
    }))
    if (currentAttributeIndex < attributes.length - 1) {
      handleNext()
    }
  }

  const getCharacterSummary = () => {
    return Object.entries(selections).map(([attr, value]) => `${attr}: ${value}`).join(', ')
  }

  const allAttributesSelected = attributes.every(attr => selections[attr.name])

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploadStatus({
      isUploading: true,
      error: null,
      success: false,
      fileName: file.name
    });

    try {
      const response = await fetch('/api/upload-character-image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.success && data.imageId) {
        setUploadStatus({
          isUploading: false,
          error: null,
          success: true,
          fileName: file.name
        });
        setHasUploadedImage(true);
        onImageUploaded(data.imageId);
        onAllAttributesSelected(true);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadStatus({
        isUploading: false,
        error: 'Failed to upload image',
        success: false,
        fileName: file.name
      });
    }
  };

  const canGenerateStory = allAttributesSelected || hasUploadedImage;

  return (
    <Card className="w-full max-w-md mx-auto bg-white shadow-xl rounded-xl">
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
            className="border-2 border-purple-300 hover:bg-purple-100 hover:text-purple-700 rounded-xl"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold text-purple-700">{currentAttribute.name}</h2>
          <Button
            onClick={handleNext}
            disabled={currentAttributeIndex === attributes.length - 1}
            variant="outline"
            size="icon"
            className="border-2 border-purple-300 hover:bg-purple-100 hover:text-purple-700 rounded-xl"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {currentAttribute.options.map((option) => (
            <Button
              key={option}
              onClick={() => handleSelection(option)}
              variant={currentSelection === option ? "default" : "outline"}
              className={`w-full border-2 rounded-xl transition-all duration-200 ${
                currentSelection === option
                  ? "bg-purple-600 text-white border-purple-500"
                  : "border-purple-300 hover:bg-purple-100 hover:text-purple-700"
              }`}
            >
              {option}
            </Button>
          ))}
        </div>
        <div className="mt-6 p-4 bg-purple-100 rounded-xl">
          <h3 className="font-semibold text-purple-800 mb-2">Character Summary</h3>
          <p className="text-sm text-purple-600">
            {getCharacterSummary()}
          </p>
        </div>
        {canGenerateStory ? (
          <div className="text-center text-green-600 font-semibold">
            {hasUploadedImage 
              ? "Image uploaded! You can now generate your story."
              : "All attributes selected! You can now generate your story."}
          </div>
        ) : (
          <div className="text-center text-yellow-600 font-semibold">
            Please either select all attributes or upload an image before generating the story.
          </div>
        )}
        <div className="space-y-4">
          <Label className="text-sm font-medium text-gray-700">
            Upload Character Image (Optional)
          </Label>
          
          <div className="mt-1 flex items-center space-x-4">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageUpload}
              disabled={uploadStatus.isUploading}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0
                       file:text-sm file:font-semibold file:bg-purple-50 
                       file:text-purple-700 hover:file:bg-purple-100
                       text-sm text-gray-600"
            />
          </div>

          {uploadStatus.isUploading && (
            <p className="text-sm text-purple-600 animate-pulse">
              Uploading {uploadStatus.fileName}...
            </p>
          )}
          
          {uploadStatus.error && (
            <p className="text-sm text-red-500">
              {uploadStatus.error}
            </p>
          )}
          
          {uploadStatus.success && (
            <p className="text-sm text-green-600">
              ✓ {uploadStatus.fileName} uploaded successfully
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

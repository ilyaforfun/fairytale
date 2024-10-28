// Add these imports at the top of the file
import SavedStories from './components/SavedStories'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Add this to the existing component's state declarations
const [isSaving, setIsSaving] = useState(false)
const [savedStories, setSavedStories] = useState([])
const [selectedSavedStory, setSelectedSavedStory] = useState(null)

// Add this function inside the component
const handleSaveStory = async () => {
  if (!story || !user) return

  setIsSaving(true)
  try {
    const storyData = {
      title: story.title,
      content: story.content,
      childName: name,
      childAge: age,
      theme,
      bookType,
      characterAttributes,
      imageUrls: [imageUrl, secondImageUrl].filter(Boolean),
      audioUrls: [firstAudioUrl, secondAudioUrl].filter(Boolean),
    }

    const response = await fetch('/api/save-story', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.id,
        storyData,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to save story')
    }

    const savedStory = await response.json()
    setSavedStories([savedStory, ...savedStories])
    setError(null)
  } catch (error) {
    console.error('Error saving story:', error)
    setError('Failed to save your story. Please try again.')
  } finally {
    setIsSaving(false)
  }
}

// Add this inside the return statement, after the LogoutButton
<Tabs defaultValue="create" className="w-full">
  <TabsList className="grid w-full grid-cols-2 mb-4">
    <TabsTrigger value="create">Create New Story</TabsTrigger>
    <TabsTrigger value="saved">Saved Stories</TabsTrigger>
  </TabsList>
  <TabsContent value="create">
    {/* Wrap the existing content here */}
  </TabsContent>
  <TabsContent value="saved">
    <SavedStories onStorySelect={setSelectedSavedStory} />
  </TabsContent>
</Tabs>

// Add this button in the story completion section, after the "Create New Story" button
{currentStage === 2 && !isSaving && (
  <Button
    onClick={handleSaveStory}
    className="ml-2 bg-green-500 hover:bg-green-600 text-white"
  >
    Save Story
  </Button>
)}

const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

async function saveStory(userId, storyData) {
  try {
    const { data, error } = await supabase
      .from('stories')
      .insert([
        {
          user_id: userId,
          title: storyData.title,
          content: storyData.content,
          child_name: storyData.childName,
          child_age: storyData.childAge,
          theme: storyData.theme,
          book_type: storyData.bookType,
          character_attributes: storyData.characterAttributes,
          image_urls: storyData.imageUrls,
          audio_urls: storyData.audioUrls,
          created_at: new Date().toISOString()
        }
      ])
      .select()

    if (error) throw error
    return data[0]
  } catch (error) {
    console.error('Error saving story:', error)
    throw error
  }
}

async function getUserStories(userId) {
  try {
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching user stories:', error)
    throw error
  }
}

async function getStoryById(storyId) {
  try {
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('id', storyId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching story:', error)
    throw error
  }
}

async function deleteStory(storyId) {
  try {
    const { error } = await supabase
      .from('stories')
      .delete()
      .eq('id', storyId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting story:', error)
    throw error
  }
}

module.exports = {
  saveStory,
  getUserStories,
  getStoryById,
  deleteStory
}

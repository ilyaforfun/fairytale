const { createClient } = require('@supabase/supabase-js')

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.error('Missing required environment variables:', {
    hasSupabaseUrl: !!process.env.SUPABASE_URL,
    hasSupabaseKey: !!process.env.SUPABASE_ANON_KEY
  })
  process.exit(1)
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

async function testSupabaseConnection() {
  try {
    // First verify connection
    console.log('Testing Supabase connection...')

    // Test inserting a sample story
    const testUserId = '00000000-0000-0000-0000-000000000000'
    const { data: insertData, error: insertError } = await supabase
      .from('stories')
      .insert([
        {
          user_id: testUserId,
          title: 'Test Story',
          content: 'Once upon a time...',
          child_name: 'Test Child',
          child_age: 5,
          theme: 'princess',
          book_type: 'pictured',
          character_attributes: { gender: 'Girl', hairColor: 'Brown' },
          image_urls: ['http://example.com/image1.jpg'],
          audio_urls: ['http://example.com/audio1.mp3']
        }
      ])
      .select()

    if (insertError) {
      console.log('Table structure verification:', {
        error: insertError,
        hint: 'Please ensure the stories table is created in your Supabase dashboard with the correct structure'
      })
      throw insertError
    }

    console.log('Test data inserted successfully:', insertData)

    // Test fetching stories
    const { data: fetchData, error: fetchError } = await supabase
      .from('stories')
      .select('*')
      .eq('user_id', testUserId)

    if (fetchError) throw fetchError
    console.log('Test data fetched successfully:', fetchData)

    // Clean up test data
    const { error: deleteError } = await supabase
      .from('stories')
      .delete()
      .eq('user_id', testUserId)

    if (deleteError) throw deleteError
    console.log('Test data cleaned up successfully')

    return true
  } catch (error) {
    console.error('Error during Supabase verification:', error)
    return false
  }
}

testSupabaseConnection()
  .then(success => {
    if (success) {
      console.log('Supabase verification completed successfully')
      process.exit(0)
    } else {
      console.log('Supabase verification failed')
      process.exit(1)
    }
  })

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

async function createStoriesTable() {
  try {
    // Read the SQL file
    const fs = require('fs')
    const path = require('path')
    const sqlContent = fs.readFileSync(
      path.join(__dirname, 'supabase/migrations/create_stories_table.sql'),
      'utf8'
    )

    // Execute the SQL using Supabase's REST API
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: sqlContent
    })

    if (error) {
      console.error('Error creating table:', error)
      return false
    }

    console.log('Table creation successful')
    return true
  } catch (error) {
    console.error('Error:', error)
    return false
  }
}

createStoriesTable()
  .then(success => {
    if (success) {
      console.log('Database setup completed successfully')
      process.exit(0)
    } else {
      console.log('Database setup failed')
      process.exit(1)
    }
  })

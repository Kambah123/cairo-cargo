const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function createUser(email, password, role, branch, fullName) {
  console.log(`Creating user: ${email}...`)
  
  // 1. Sign up the user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (authError) {
    console.error(`Auth Error for ${email}:`, authError.message)
    return
  }
  
  const userId = authData.user.id
  console.log(`User created in auth.users with ID: ${userId}`)
  
  // 2. Insert into staff_profiles
  const { error: profileError } = await supabase
    .from('staff_profiles')
    .insert([
      {
        id: userId,
        email: email,
        full_name: fullName,
        role: role,
        branch: branch,
        is_active: true
      }
    ])
    
  if (profileError) {
    console.error(`Profile Error for ${email}:`, profileError.message)
  } else {
    console.log(`Profile created successfully for ${email}!\n`)
  }
}

async function run() {
  await createUser('skamberuk@gmail.com', 'Kambah@123', 'cairo_staff', 'cairo', 'Cairo Staff')
  await supabase.auth.signOut()
  await createUser('skamberjob@gmail.com', 'Kambah@123', 'admin', 'cairo', 'System Admin')
}

run()

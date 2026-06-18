"use server"

import { createClient } from '@supabase/supabase-js'

export async function createStaffUser(formData) {
  const email = formData.get('email')
  const password = formData.get('password')
  const fullName = formData.get('full_name')
  const role = formData.get('role')
  const branch = formData.get('branch')

  if (!email || !password || !fullName || !role || !branch) {
    return { success: false, error: 'All fields are required.' }
  }

  // Create a fresh Supabase client that does NOT persist the session
  // This ensures the current admin's session in the browser isn't overwritten
  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    }
  )

  try {
    // 1. Sign up the user (Email confirmations are disabled on this project)
    const { data: authData, error: authError } = await adminSupabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      console.log("Auth creation failed:", authError.message)
      return { success: false, error: authError.message }
    }

    if (!authData?.user?.id) {
      return { success: false, error: 'User ID was not generated.' }
    }

    const userId = authData.user.id

    // 2. Insert the user into staff_profiles
    const { error: profileError } = await adminSupabase
      .from('staff_profiles')
      .insert([{
        id: userId,
        email,
        full_name: fullName,
        role,
        branch,
        is_active: true
      }])

    if (profileError) {
      console.log("Profile insertion failed:", profileError.message)
      // Note: Ideally, we'd roll back the auth.user creation here, but we lack service_role permissions for deletion.
      return { success: false, error: "Auth user created, but profile insertion failed: " + profileError.message }
    }

    return { success: true }
  } catch (err) {
    console.log("Unexpected error creating user:", err?.message || 'Unknown error')
    return { success: false, error: 'An unexpected error occurred.' }
  }
}

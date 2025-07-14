import { createClient } from "@supabase/supabase-js"

// Use fallback values for preview environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://demo.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "demo-key"
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "demo-service-key"

// Create a simple client without type constraints to avoid webpack issues
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client for admin operations
export const createServerClient = () => {
  // Use anon key if service key is not available
  const key = supabaseServiceKey !== "demo-service-key" ? supabaseServiceKey : supabaseAnonKey
  return createClient(supabaseUrl, key)
}

// Add this export to the existing supabase.ts file
export function getClient() {
  return supabase
}

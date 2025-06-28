import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Use fallback values for preview environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://demo.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "demo-key"
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "demo-service-key"

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Server-side client for admin operations
export const createServerClient = () => {
  return createClient<Database>(supabaseUrl, supabaseServiceKey)
}

// Add this export to the existing supabase.ts file
export function getClient() {
  return supabase
}

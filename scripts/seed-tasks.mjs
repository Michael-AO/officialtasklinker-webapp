/**
 * Seed tasks into the database. Uses SUPABASE_SERVICE_ROLE_KEY so it does not require admin login.
 * Run: node --env-file=.env.local scripts/seed-tasks.mjs
 */

import { createClient } from "@supabase/supabase-js"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Use: node --env-file=.env.local scripts/seed-tasks.mjs")
  process.exit(1)
}

const supabase = createClient(url, serviceKey)

const DEMO_TASKS = [
  { title: "Landing page design", description: "Need a modern landing page for our SaaS product.", category: "Web Development", budget: 150000 },
  { title: "Mobile app UI", description: "Design screens for a fitness tracking app.", category: "Design", budget: 200000 },
  { title: "Blog content series", description: "10 SEO-optimized articles about remote work.", category: "Writing", budget: 80000 },
  { title: "Data pipeline setup", description: "ETL pipeline with Python and PostgreSQL.", category: "Data Science", budget: 250000 },
  { title: "Social media graphics", description: "Monthly social media asset pack.", category: "Marketing", budget: 60000 },
]

async function main() {
  const { data: clients } = await supabase.from("users").select("id").eq("user_type", "client").limit(1)
  const clientId = clients?.[0]?.id
  if (!clientId) {
    console.error("No client user found. Create a client account first.")
    process.exit(1)
  }

  const now = new Date().toISOString()
  const taskInserts = DEMO_TASKS.map((t) => ({
    client_id: clientId,
    title: t.title,
    description: t.description,
    category: t.category,
    budget_type: "fixed",
    budget_min: t.budget,
    budget_max: t.budget,
    currency: "NGN",
    duration: "2-4 weeks",
    location: "Remote",
    experience_level: "intermediate",
    urgency: "normal",
    status: "active",
    visibility: "public",
    skills_required: [],
    questions: [],
    requirements: [],
    applications_count: 0,
    views_count: 0,
    created_at: now,
    updated_at: now,
  }))

  const { data: inserted, error } = await supabase.from("tasks").insert(taskInserts).select("id")
  if (error) {
    console.error("Seed tasks error:", error.message)
    process.exit(1)
  }
  console.log("Seeded", inserted?.length ?? 0, "tasks. IDs:", inserted?.map((t) => t.id).join(", "))
}

main()

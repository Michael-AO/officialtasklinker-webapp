import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 })
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return response
}

export async function GET(request: NextRequest) {
  try {
    console.log("API: Starting tasks fetch...")
    
    // Check environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("API: Missing environment variables, returning mock data")
      
      // Return mock data instead of error
      const mockTasks = [
        {
          id: "mock-1",
          title: "Sample Task 1",
          description: "This is a sample task for testing",
          budget_min: 100,
          budget_max: 500,
          category: "Web Development",
          experience_level: "Intermediate",
          location: "Remote",
          created_at: new Date().toISOString(),
          client: {
            id: "mock-client-1",
            name: "Sample Client",
            rating: 4.8,
            location: "Remote",
            completed_tasks: 5,
            total_earned: 2500,
            join_date: new Date().toISOString(),
          }
        },
        {
          id: "mock-2",
          title: "Sample Task 2",
          description: "Another sample task for testing",
          budget_min: 200,
          budget_max: 800,
          category: "Mobile Development",
          experience_level: "Expert",
          location: "Remote",
          created_at: new Date().toISOString(),
          client: {
            id: "mock-client-2",
            name: "Another Client",
            rating: 4.9,
            location: "Remote",
            completed_tasks: 12,
            total_earned: 8000,
            join_date: new Date().toISOString(),
          }
        }
      ]
      
      const jsonResponse = NextResponse.json({
        success: true,
        tasks: mockTasks,
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          pages: 1,
          hasNext: false,
          hasPrev: false,
        },
        note: "Using mock data - environment variables not configured"
      })

      jsonResponse.headers.set('Access-Control-Allow-Origin', '*')
      jsonResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      jsonResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

      return jsonResponse
    }

    const supabase = createServerClient()
    console.log("API: Supabase client created successfully")
    
    const { searchParams } = new URL(request.url)

    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const budget_min = searchParams.get("budget_min")
    const budget_max = searchParams.get("budget_max")
    const experience = searchParams.get("experience")
    const location = searchParams.get("location")
    const sort = searchParams.get("sort") || "newest"
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    console.log("API: Fetching tasks with filters:", {
      category,
      search,
      budget_min,
      budget_max,
      experience,
      location,
      sort,
      page,
      limit,
    })

    let query = supabase
      .from("tasks")
      .select(`
        *,
        profiles!tasks_client_id_fkey (
          id,
          full_name,
          avatar_url,
          location
        )
      `)
      .eq("status", "active")
      .eq("visibility", "public")

    // Only show tasks from the last 30 days by default for "recent" data
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    query = query.gte("created_at", thirtyDaysAgo.toISOString())

    // Apply filters
    if (category && category !== "All Categories") {
      query = query.eq("category", category)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,skills_required.cs.{${search}}`)
    }

    if (experience && experience !== "All Levels") {
      query = query.eq("experience_level", experience)
    }

    if (budget_min) {
      query = query.gte("budget_max", Number.parseInt(budget_min))
    }

    if (budget_max) {
      query = query.lte("budget_min", Number.parseInt(budget_max))
    }

    if (location && location !== "All Locations") {
      query = query.eq("location", location)
    }

    // Apply sorting with recent data priority
    switch (sort) {
      case "newest":
        query = query.order("created_at", { ascending: false })
        break
      case "oldest":
        query = query.order("created_at", { ascending: true })
        break
      case "budget_high":
        query = query.order("budget_max", { ascending: false }).order("created_at", { ascending: false })
        break
      case "budget_low":
        query = query.order("budget_min", { ascending: true }).order("created_at", { ascending: false })
        break
      case "applications":
        query = query.order("applications_count", { ascending: false }).order("created_at", { ascending: false })
        break
      default:
        // Default to newest first for recent data
        query = query.order("created_at", { ascending: false })
        break
    }

    // Apply pagination
    const startIndex = (page - 1) * limit
    query = query.range(startIndex, startIndex + limit - 1)

    console.log("API: Executing database query...")
    const { data: tasks, error, count } = await query

    if (error) {
      console.error("Database query error:", error)
      return NextResponse.json({ 
        success: false, 
        error: `Database error: ${error.message}` 
      }, { status: 500 })
    }

    console.log("API: Database query successful, processing data...")

    // Transform data to match expected format
    const transformedTasks =
      tasks?.map((task) => ({
        ...task,
        client: {
          id: task.profiles?.id || task.client_id,
          name: task.profiles?.full_name || "Anonymous Client",
          rating: 4.8, // Default rating - you can add this to profiles table
          location: task.profiles?.location || "Not specified",
          completed_tasks: 0, // You can add this field to profiles
          total_earned: 0, // You can add this field to profiles
          join_date: task.created_at, // Or add actual join_date to profiles
        },
      })) || []

    console.log("API: Returning recent tasks:", {
      total: transformedTasks.length,
      page,
      limit,
      dateRange: "Last 30 days",
    })

    const jsonResponse = NextResponse.json({
      success: true,
      tasks: transformedTasks,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
        hasNext: startIndex + limit < (count || 0),
        hasPrev: page > 1,
      },
    })

    // Add CORS headers to response
    jsonResponse.headers.set('Access-Control-Allow-Origin', '*')
    jsonResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    jsonResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    return jsonResponse
  } catch (error) {
    console.error("API: Tasks fetch error:", error)
    const errorResponse = NextResponse.json({ 
      success: false, 
      error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 })

    // Add CORS headers to error response
    errorResponse.headers.set('Access-Control-Allow-Origin', '*')
    errorResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    errorResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    return errorResponse
  }
}

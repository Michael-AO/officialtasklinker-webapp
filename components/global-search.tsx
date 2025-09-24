"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Search, FileText, Users, MessageSquare, DollarSign, Clock } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface SearchResult {
  id: string
  type: "task" | "application" | "message" | "user"
  title: string
  description: string
  metadata: {
    budget?: string
    status?: string
    date?: string
    rating?: number
    category?: string
  }
  url: string
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const prevOpen = useRef(open)
  const [allTasks, setAllTasks] = useState<any[]>([])

  useEffect(() => {
    const fetchTasks = async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("id, title, description, budget_max, budget_type, created_at, category, status, skills_required")
        .eq("status", "active")
        .eq("visibility", "public")
        .order("created_at", { ascending: false })
        .limit(50)
      if (!error && data) setAllTasks(data)
    }
    fetchTasks()
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  useEffect(() => {
    if (searchTerm.length > 0) {
      setIsLoading(true)
      const timeoutId = setTimeout(() => {
        const filtered = allTasks
          .filter((task) =>
            task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (task.category && task.category.toLowerCase().includes(searchTerm.toLowerCase()))
          )
          .map((task) => ({
            id: task.id,
            type: "task" as const,
            title: task.title,
            description: task.description,
            metadata: {
              budget: task.budget_max ? `₦${task.budget_max.toLocaleString()}` : undefined,
              status: task.status,
              date: task.created_at ? new Date(task.created_at).toLocaleDateString() : undefined,
              category: task.category,
            },
            url: `/dashboard/browse/${task.id}`,
          }))
        setResults(filtered)
        setIsLoading(false)
      }, 300)
      return () => clearTimeout(timeoutId)
    } else {
      setResults([])
      setIsLoading(false)
    }
  }, [searchTerm, allTasks])

  useEffect(() => {
    if (prevOpen.current && !open) {
      setSearchTerm("")
      setResults([])
      setIsLoading(false)
    }
    prevOpen.current = open
  }, [open])

  const getIcon = (type: string) => {
    switch (type) {
      case "task":
        return <FileText className="h-4 w-4" />
      case "application":
        return <Users className="h-4 w-4" />
      case "message":
        return <MessageSquare className="h-4 w-4" />
      case "user":
        return <Users className="h-4 w-4" />
      default:
        return <Search className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "task":
        return "bg-blue-100 text-blue-800"
      case "application":
        return "bg-green-100 text-green-800"
      case "message":
        return "bg-purple-100 text-purple-800"
      case "user":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleResultClick = (url: string) => {
    setOpen(false)
    setSearchTerm("")
    setResults([])
    // Navigate to the URL
    window.location.href = url
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="relative w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
        >
          <Search className="mr-2 h-4 w-4" />
          <span className="hidden lg:inline-flex">Search everything...</span>
          <span className="inline-flex lg:hidden">Search...</span>
          <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Search</DialogTitle>
        </DialogHeader>
        <Command className="rounded-lg border shadow-md">
          <CommandInput
            placeholder="Search tasks, applications, messages..."
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            {isLoading && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                <div className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  Searching...
                </div>
              </div>
            )}
            {!isLoading && searchTerm.length > 0 && results.length === 0 && (
              <CommandEmpty>
                <div className="text-center py-6">
                  <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">No results found</p>
                  <p className="text-sm text-muted-foreground">Try searching for tasks, applications, or messages</p>
                </div>
              </CommandEmpty>
            )}
            {!isLoading && results.length > 0 && (
              <>
                <div className="flex flex-col gap-3 mt-2">
                  {results.map((result) => (
                    <div
                      key={result.id}
                      className="bg-background border rounded-lg shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleResultClick(result.url)}
                      tabIndex={0}
                      role="button"
                      style={{ outline: 'none' }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-base truncate">{result.title}</span>
                        {result.metadata.budget && (
                          <span className="text-green-600 font-bold text-sm ml-2">{result.metadata.budget}</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mb-2 flex items-center gap-2">
                        {result.metadata.date && <span>{result.metadata.date}</span>}
                        {result.metadata.category && <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">{result.metadata.category}</span>}
                      </div>
                      <div className="text-sm text-gray-700 mb-1 line-clamp-2">{result.description}</div>
                      <div className="flex items-center gap-2 mt-2">
                        {result.type && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-800 text-xs rounded-full capitalize">{result.type}</span>
                        )}
                        {result.metadata.status && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">{result.metadata.status}</span>
                        )}

                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
            {searchTerm.length === 0 && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                <div className="space-y-2">
                  <Search className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p>Start typing to search...</p>
                  <div className="text-xs space-y-1">
                    <p>• Search for tasks and projects</p>
                    <p>• Find your applications</p>
                    <p>• Look up messages and conversations</p>
                  </div>
                </div>
              </div>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Search, FileText, Users, MessageSquare, DollarSign, Clock, Star } from "lucide-react"

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

const mockSearchResults: SearchResult[] = [
  {
    id: "1",
    type: "task",
    title: "E-commerce Website Development",
    description: "Build a modern e-commerce platform with React and Node.js",
    metadata: {
      budget: "$2,500",
      status: "active",
      date: "2 days ago",
      category: "Web Development",
    },
    url: "/dashboard/browse/1",
  },
  {
    id: "2",
    type: "application",
    title: "Mobile App UI/UX Design",
    description: "Applied for mobile app design project",
    metadata: {
      budget: "$42/hr",
      status: "accepted",
      date: "1 week ago",
      category: "Design",
    },
    url: "/dashboard/applications/2",
  },
  {
    id: "3",
    type: "user",
    title: "Sarah Johnson",
    description: "Full-stack developer specializing in React and Node.js",
    metadata: {
      rating: 4.8,
      category: "Web Development",
    },
    url: "/dashboard/freelancers/sarah-johnson",
  },
  {
    id: "4",
    type: "message",
    title: "Project Discussion with TechCorp",
    description: "Latest message: 'When can we schedule the next milestone review?'",
    metadata: {
      date: "2 hours ago",
    },
    url: "/dashboard/messages?conversation=techcorp",
  },
  {
    id: "5",
    type: "task",
    title: "Mobile App Development",
    description: "iOS and Android app development with React Native",
    metadata: {
      budget: "$3,200",
      status: "active",
      date: "1 day ago",
      category: "Mobile Development",
    },
    url: "/dashboard/browse/5",
  },
  {
    id: "6",
    type: "task",
    title: "Logo Design Project",
    description: "Creative logo design for startup company",
    metadata: {
      budget: "$500",
      status: "active",
      date: "3 days ago",
      category: "Design",
    },
    url: "/dashboard/browse/6",
  },
]

export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)

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
      // Simulate API call with realistic delay
      const timeoutId = setTimeout(() => {
        const filtered = mockSearchResults.filter(
          (result) =>
            result.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            result.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            result.metadata.category?.toLowerCase().includes(searchTerm.toLowerCase()),
        )
        setResults(filtered)
        setIsLoading(false)
      }, 300)

      return () => clearTimeout(timeoutId)
    } else {
      setResults([])
      setIsLoading(false)
    }
  }, [searchTerm])

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
              <CommandGroup heading={`${results.length} result${results.length === 1 ? "" : "s"} found`}>
                {results.map((result) => (
                  <CommandItem
                    key={result.id}
                    onSelect={() => handleResultClick(result.url)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-start gap-3 p-2 w-full">
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {getIcon(result.type)}
                        <Badge variant="secondary" className={getTypeColor(result.type)}>
                          {result.type}
                        </Badge>
                      </div>
                      <div className="flex-1 space-y-1 min-w-0">
                        <p className="font-medium truncate">{result.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">{result.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {result.metadata.budget && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              {result.metadata.budget}
                            </div>
                          )}
                          {result.metadata.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              {result.metadata.rating}
                            </div>
                          )}
                          {result.metadata.date && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {result.metadata.date}
                            </div>
                          )}
                          {result.metadata.status && (
                            <Badge variant="outline" className="text-xs">
                              {result.metadata.status}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
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

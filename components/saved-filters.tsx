"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Bookmark, Plus, Search, Filter, Bell, Trash2, DollarSign, MapPin, Clock } from "lucide-react"

interface SavedFilter {
  id: string
  name: string
  description: string
  filters: {
    category?: string
    budgetMin?: number
    budgetMax?: number
    location?: string
    skills?: string[]
    postedWithin?: string
  }
  alertsEnabled: boolean
  createdAt: string
  matchCount: number
}

interface SavedFiltersProps {
  onApplyFilter?: (filters: any) => void
}

export function SavedFilters({ onApplyFilter }: SavedFiltersProps) {
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newFilterName, setNewFilterName] = useState("")
  const [newFilterDescription, setNewFilterDescription] = useState("")

  useEffect(() => {
    // Load saved filters from localStorage or API
    const mockFilters: SavedFilter[] = [
      {
        id: "1",
        name: "React Development Jobs",
        description: "High-paying React projects",
        filters: {
          category: "web-dev",
          budgetMin: 1000,
          skills: ["React", "TypeScript"],
          postedWithin: "7days",
        },
        alertsEnabled: true,
        createdAt: "2024-01-15",
        matchCount: 12,
      },
      {
        id: "2",
        name: "Remote Design Work",
        description: "UI/UX design projects, remote only",
        filters: {
          category: "design",
          location: "Remote",
          budgetMin: 500,
          skills: ["Figma", "UI/UX"],
        },
        alertsEnabled: false,
        createdAt: "2024-01-10",
        matchCount: 8,
      },
      {
        id: "3",
        name: "Quick Writing Gigs",
        description: "Fast turnaround writing projects",
        filters: {
          category: "writing",
          budgetMax: 500,
          postedWithin: "24hours",
        },
        alertsEnabled: true,
        createdAt: "2024-01-08",
        matchCount: 15,
      },
    ]

    setSavedFilters(mockFilters)
  }, [])

  const handleCreateFilter = () => {
    if (!newFilterName.trim()) return

    const newFilter: SavedFilter = {
      id: Date.now().toString(),
      name: newFilterName,
      description: newFilterDescription,
      filters: {}, // Would be populated from current search filters
      alertsEnabled: false,
      createdAt: new Date().toISOString().split("T")[0],
      matchCount: 0,
    }

    setSavedFilters((prev) => [newFilter, ...prev])
    setNewFilterName("")
    setNewFilterDescription("")
    setIsCreateDialogOpen(false)
  }

  const handleDeleteFilter = (filterId: string) => {
    setSavedFilters((prev) => prev.filter((filter) => filter.id !== filterId))
  }

  const handleToggleAlerts = (filterId: string) => {
    setSavedFilters((prev) =>
      prev.map((filter) => (filter.id === filterId ? { ...filter, alertsEnabled: !filter.alertsEnabled } : filter)),
    )
  }

  const handleApplyFilter = (filter: SavedFilter) => {
    onApplyFilter?.(filter.filters)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bookmark className="h-5 w-5 text-blue-600" />
              Saved Searches
            </CardTitle>
            <CardDescription>Quick access to your favorite search criteria</CardDescription>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Save Current Search
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save Search Filter</DialogTitle>
                <DialogDescription>Save your current search criteria for quick access later</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="filterName">Filter Name</Label>
                  <Input
                    id="filterName"
                    placeholder="e.g., React Development Jobs"
                    value={newFilterName}
                    onChange={(e) => setNewFilterName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="filterDescription">Description (Optional)</Label>
                  <Input
                    id="filterDescription"
                    placeholder="Brief description of this filter"
                    value={newFilterDescription}
                    onChange={(e) => setNewFilterDescription(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateFilter}>Save Filter</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {savedFilters.length === 0 ? (
          <div className="text-center py-8">
            <Bookmark className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No saved searches yet</h3>
            <p className="text-gray-600 mb-4">Save your search criteria to quickly find relevant tasks</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Filter
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {savedFilters.map((filter) => (
              <Card key={filter.id} className="border-l-4 border-l-blue-500">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{filter.name}</h3>
                        {filter.alertsEnabled && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Bell className="h-3 w-3" />
                            Alerts On
                          </Badge>
                        )}
                      </div>

                      {filter.description && <p className="text-sm text-muted-foreground">{filter.description}</p>}

                      {/* Filter Summary */}
                      <div className="flex flex-wrap gap-2 text-xs">
                        {filter.filters.category && (
                          <Badge variant="outline">
                            <Filter className="h-3 w-3 mr-1" />
                            {filter.filters.category}
                          </Badge>
                        )}
                        {(filter.filters.budgetMin || filter.filters.budgetMax) && (
                          <Badge variant="outline">
                            <DollarSign className="h-3 w-3 mr-1" />
                            {filter.filters.budgetMin && `$${filter.filters.budgetMin}+`}
                            {filter.filters.budgetMax && ` - $${filter.filters.budgetMax}`}
                          </Badge>
                        )}
                        {filter.filters.location && (
                          <Badge variant="outline">
                            <MapPin className="h-3 w-3 mr-1" />
                            {filter.filters.location}
                          </Badge>
                        )}
                        {filter.filters.postedWithin && (
                          <Badge variant="outline">
                            <Clock className="h-3 w-3 mr-1" />
                            {filter.filters.postedWithin}
                          </Badge>
                        )}
                      </div>

                      {filter.filters.skills && filter.filters.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {filter.filters.skills.map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{filter.matchCount} current matches</span>
                        <span>Created {new Date(filter.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleAlerts(filter.id)}
                        className={filter.alertsEnabled ? "text-blue-600" : "text-gray-400"}
                      >
                        <Bell className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteFilter(filter.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" onClick={() => handleApplyFilter(filter)}>
                        <Search className="h-4 w-4 mr-2" />
                        Apply
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

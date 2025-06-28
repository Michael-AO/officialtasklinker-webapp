"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

// Force dynamic rendering to prevent prerender errors
export const dynamic = "force-dynamic"

export default function CreateTaskPage() {
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    budget: 0,
    deadline: "",
    category: "",
  })

  const router = useRouter()

  // Ensure component is mounted before using router
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()

    // Mock user data for build compatibility
    const mockUser = {
      id: "user-123",
      email: "user@example.com",
      name: "Test User",
      userType: "client",
      isVerified: false,
      skills: [],
      bio: "",
      location: "",
      hourlyRate: null,
    }

    const taskData = {
      ...formData,
      user_data: mockUser,
    }

    console.log("Submitting task data:", taskData)

    try {
      const response = await fetch("/api/tasks/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      })

      if (response.ok) {
        // Only navigate if component is mounted (client-side)
        if (mounted) {
          router.push("/dashboard/tasks")
        }
      } else {
        console.error("Task creation failed")
        alert("Task creation failed. Please try again.")
      }
    } catch (error) {
      console.error("Error creating task:", error)
      alert("An error occurred. Please try again.")
    }
  }

  return (
    <div className="container mx-auto mt-8 px-4">
      <h1 className="text-2xl font-bold mb-4">Create a New Task</h1>
      <form onSubmit={handleSubmit} className="max-w-lg">
        <div className="mb-4">
          <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">
            Title:
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
            Description:
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="budget" className="block text-gray-700 text-sm font-bold mb-2">
            Budget (₦):
          </label>
          <input
            type="number"
            id="budget"
            name="budget"
            value={formData.budget}
            onChange={handleChange}
            required
            min="0"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="deadline" className="block text-gray-700 text-sm font-bold mb-2">
            Deadline:
          </label>
          <input
            type="date"
            id="deadline"
            name="deadline"
            value={formData.deadline}
            onChange={handleChange}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="category" className="block text-gray-700 text-sm font-bold mb-2">
            Category:
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="">Select a category</option>
            <option value="Web Development">Web Development</option>
            <option value="Mobile Development">Mobile Development</option>
            <option value="Design">Design</option>
            <option value="Writing">Writing</option>
            <option value="Marketing">Marketing</option>
            <option value="Data Analysis">Data Analysis</option>
          </select>
        </div>
        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Create Task
          </button>
          <button
            type="button"
            onClick={() => mounted && router.push("/dashboard/tasks")}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

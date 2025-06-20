"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, DollarSign, Calendar, MapPin, Star, Clock, FileText, Send } from "lucide-react"

interface TaskApplicationPageProps {
  params: {
    id: string
  }
}

export default function TaskApplicationPage({ params }: TaskApplicationPageProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [applicationData, setApplicationData] = useState({
    proposedAmount: "",
    coverLetter: "",
    estimatedDuration: "",
    questions: {} as Record<string, string>,
  })

  // Mock task data - in real app, this would be fetched based on params.id
  const task = {
    id: params.id,
    title: "E-commerce Website Development",
    description:
      "Looking for an experienced developer to build a modern e-commerce website with payment integration and admin panel. The project requires expertise in React, Node.js, and database management.",
    budget: "₦250,000 - ₦400,000",
    category: "Web Development",
    location: "Remote",
    postedBy: "Sarah Johnson",
    postedDate: "2 days ago",
    proposals: 12,
    skills: ["React", "Node.js", "MongoDB", "Stripe", "Payment Integration"],
    clientRating: 4.8,
    clientReviews: 23,
    questions: [
      "How many years of experience do you have with React and Node.js?",
      "Can you provide examples of similar e-commerce projects you've completed?",
      "What is your approach to handling payment integrations securely?",
    ],
    requirements: [
      "5+ years of experience in full-stack development",
      "Proven experience with e-commerce platforms",
      "Strong knowledge of payment gateway integrations",
      "Ability to work independently and meet deadlines",
      "Good communication skills",
    ],
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Here you would submit the application
      console.log("Application submitted:", {
        taskId: params.id,
        ...applicationData,
      })

      // Redirect to applications page or show success message
      router.push("/dashboard/applications?status=submitted")
    } catch (error) {
      console.error("Failed to submit application:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateQuestion = (index: number, answer: string) => {
    setApplicationData((prev) => ({
      ...prev,
      questions: {
        ...prev.questions,
        [index]: answer,
      },
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Apply for Task</h1>
          <p className="text-muted-foreground">Submit your proposal for this project</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Task Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{task.title}</CardTitle>
              <CardDescription>{task.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  {task.budget}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {task.location}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {task.postedDate}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {task.skills.map((skill) => (
                  <Badge key={skill} variant="outline">
                    {skill}
                  </Badge>
                ))}
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-2">Requirements:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {task.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Application Form */}
          <Card>
            <CardHeader>
              <CardTitle>Your Proposal</CardTitle>
              <CardDescription>Provide details about your approach and pricing</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Your Proposed Amount (₦)</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={applicationData.proposedAmount}
                      onChange={(e) =>
                        setApplicationData((prev) => ({
                          ...prev,
                          proposedAmount: e.target.value,
                        }))
                      }
                      placeholder="250000"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Estimated Duration</Label>
                    <Input
                      id="duration"
                      value={applicationData.estimatedDuration}
                      onChange={(e) =>
                        setApplicationData((prev) => ({
                          ...prev,
                          estimatedDuration: e.target.value,
                        }))
                      }
                      placeholder="e.g., 3 weeks"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="coverLetter">Cover Letter</Label>
                  <Textarea
                    id="coverLetter"
                    value={applicationData.coverLetter}
                    onChange={(e) =>
                      setApplicationData((prev) => ({
                        ...prev,
                        coverLetter: e.target.value,
                      }))
                    }
                    placeholder="Describe your experience, approach, and why you're the best fit for this project..."
                    rows={6}
                    required
                  />
                </div>

                {/* Client Questions */}
                {task.questions.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-semibold">Client Questions</h4>
                    {task.questions.map((question, index) => (
                      <div key={index} className="space-y-2">
                        <Label htmlFor={`question-${index}`}>
                          {index + 1}. {question}
                        </Label>
                        <Textarea
                          id={`question-${index}`}
                          value={applicationData.questions[index] || ""}
                          onChange={(e) => updateQuestion(index, e.target.value)}
                          placeholder="Your answer..."
                          rows={3}
                          required
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-end gap-4">
                  <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Application
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Client Info & Stats */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About the Client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src="/placeholder.svg?height=40&width=40" />
                  <AvatarFallback>SJ</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{task.postedBy}</p>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">
                      {task.clientRating} ({task.clientReviews} reviews)
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Member since:</span>
                  <span>Jan 2023</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Projects posted:</span>
                  <span>15</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hire rate:</span>
                  <span>85%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Competition</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Proposals submitted:</span>
                <span className="font-medium">{task.proposals}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Average bid:</span>
                <span className="font-medium">₦320,000</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Your ranking:</span>
                <Badge variant="outline">Top 20%</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tips for Success</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-blue-600 mt-0.5" />
                <span>Write a personalized cover letter</span>
              </div>
              <div className="flex items-start gap-2">
                <DollarSign className="h-4 w-4 text-green-600 mt-0.5" />
                <span>Bid competitively but fairly</span>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-purple-600 mt-0.5" />
                <span>Provide realistic timelines</span>
              </div>
              <div className="flex items-start gap-2">
                <Star className="h-4 w-4 text-yellow-600 mt-0.5" />
                <span>Highlight relevant experience</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

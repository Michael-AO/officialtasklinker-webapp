"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Eye, Calendar, DollarSign, User, FileText, ExternalLink } from "lucide-react"
import { format } from "date-fns"

interface Application {
  id: string
  user_id: string
  task_id: string
  status: string
  proposed_budget: number
  proposed_timeline: number
  cover_letter: string
  created_at: string
  updated_at: string
  freelancer: {
    id: string
    name: string
    email: string
    avatar_url?: string
  }
  portfolio?: {
    id: string
    title: string
    description?: string
    file_url?: string
  }[]
  answers?: {
    question: string
    answer: string
  }[]
}

interface ViewApplicationModalProps {
  application: Application
  trigger?: React.ReactNode
}

export function ViewApplicationModal({ application, trigger }: ViewApplicationModalProps) {
  const [open, setOpen] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            View Application
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Application from {application.freelancer.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Application Status */}
          <div className="flex items-center justify-between">
            <Badge className={getStatusColor(application.status)}>
              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
            </Badge>
            <div className="text-sm text-gray-500">
              Applied on {format(new Date(application.created_at), "PPP")}
            </div>
          </div>

          <Separator />

          {/* Freelancer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Freelancer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  {application.freelancer.avatar_url ? (
                    <img
                      src={application.freelancer.avatar_url}
                      alt={application.freelancer.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-6 w-6 text-gray-500" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">{application.freelancer.name}</h3>
                  <p className="text-sm text-gray-600">{application.freelancer.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Proposal Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Proposal Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Proposed Budget:</span>
                  <span className="text-green-600 font-semibold">
                    {formatCurrency(application.proposed_budget)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Timeline:</span>
                  <span className="text-blue-600 font-semibold">
                    {application.proposed_timeline} days
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cover Letter */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Cover Letter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">{application.cover_letter}</p>
              </div>
            </CardContent>
          </Card>

          {/* Application Questions */}
          {application.answers && application.answers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Application Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {application.answers.map((qa, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-medium text-gray-900 mb-2">{qa.question}</h4>
                      <p className="text-gray-700">{qa.answer}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Portfolio */}
          {application.portfolio && application.portfolio.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Portfolio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {application.portfolio.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{item.title}</h4>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            // Create a simple text file with portfolio information
                            const content = `Portfolio Item: ${item.title}\n\nDescription: ${item.description || 'No description provided'}\n\nThis is a portfolio item from the freelancer's application.`;
                            const blob = new Blob([content], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `${item.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                          }}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                      {item.description && (
                        <p className="text-gray-600 text-sm">{item.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 
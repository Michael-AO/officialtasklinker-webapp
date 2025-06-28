"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, CreditCard, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Task {
  id: string
  title: string
  description: string
  budget_max?: number
  budget_min?: number
  category: string
}

const formatNaira = (amount: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(amount)
}

export default function EscrowSetupPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()

  const taskId = searchParams.get("taskId")
  const [task, setTask] = useState<Task | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTask = async () => {
      if (!taskId) {
        toast({
          title: "Error",
          description: "Task ID is required.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/tasks/${taskId}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setTask(data)
      } catch (error: any) {
        toast({
          title: "Error",
          description: `Failed to fetch task: ${error.message}`,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTask()
  }, [taskId, toast])

  const handlePaymentSetup = () => {
    toast({
      title: "Coming Soon",
      description: "Escrow payment setup will be available in the next update.",
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading task details...</span>
        </div>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Task Not Found</h2>
            <p className="text-muted-foreground mb-4">The requested task could not be found.</p>
            <Button onClick={() => router.push("/dashboard/tasks")}>Back to Tasks</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const budget = task.budget_max || task.budget_min || 0

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Escrow Setup</h1>
        <p className="text-muted-foreground">Set up secure payment escrow for your project</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Task Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Title</label>
            <p className="text-lg font-medium">{task.title}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Description</label>
            <p className="text-sm">{task.description}</p>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Budget</label>
              <p className="text-xl font-bold text-green-600">{formatNaira(budget)}</p>
            </div>
            <Badge variant="secondary">{task.category}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Escrow Protection</h3>
            <p className="text-sm text-muted-foreground">
              Your payment of {formatNaira(budget)} will be held securely in escrow until the work is completed to your
              satisfaction.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Project Amount:</span>
              <span>{formatNaira(budget)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Service Fee (5%):</span>
              <span>{formatNaira(budget * 0.05)}</span>
            </div>
            <hr />
            <div className="flex justify-between font-medium">
              <span>Total:</span>
              <span>{formatNaira(budget * 1.05)}</span>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={handlePaymentSetup} className="flex-1" disabled>
              Setup Escrow Payment
            </Button>
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

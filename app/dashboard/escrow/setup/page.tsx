"use client"
import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { toast } from "react-hot-toast"
import { PaystackButton } from "react-paystack"

import { formatNaira } from "@/lib/utils"
import type { Task } from "@/types"

const EscrowSetupPage = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { data: session } = useSession()

  const taskId = searchParams.get("taskId")
  const [task, setTask] = useState<Task | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTask = async () => {
      if (!taskId) {
        toast.error("Task ID is required.")
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
        toast.error(`Failed to fetch task: ${error.message}`)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTask()
  }, [taskId])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!task) {
    return <div>Task not found.</div>
  }

  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || ""

  const handlePayment = async () => {
    if (!session?.user?.email) {
      toast.error("Please sign in to continue.")
      return
    }

    const amount = task.budget_max || task.budget_min || 100000 // Use actual task budget

    const paymentDetails = {
      amount,
      email: session.user.email,
      task_id: task.id,
    }

    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentDetails),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      toast.success("Payment initialized. Redirecting...")
      router.push(`/dashboard/escrow/payment-status?paymentId=${data.paymentId}`)
    } catch (error: any) {
      toast.error(`Failed to initialize payment: ${error.message}`)
    }
  }

  const componentProps = {
    email: session?.user?.email || "",
    amount: (task.budget_max || task.budget_min || 100000) * 100, // Convert to kobo and use task budget
    publicKey,
    text: "Pay Now",
    onSuccess: () => handlePayment(), // Trigger handlePayment on success
    onClose: () => toast.error("Payment window closed."),
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Escrow Setup</h1>
      <div className="bg-white shadow-md rounded-md p-4">
        <h2 className="text-lg font-semibold mb-2">Task Details</h2>
        <p>
          <strong>Title:</strong> {task.title}
        </p>
        <p>
          <strong>Description:</strong> {task.description}
        </p>
        <p>
          <strong>Budget:</strong> {formatNaira(task.budget_max || task.budget_min || 0)}
        </p>
        <p>
          <strong>Category:</strong> {task.category}
        </p>
      </div>

      <div className="mt-4">
        <h2 className="text-lg font-semibold mb-2">Payment</h2>
        <p>You are about to pay {formatNaira(task.budget_max || task.budget_min || 0)} into escrow.</p>
        <PaystackButton
          {...componentProps}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2"
        />
      </div>
    </div>
  )
}

export default EscrowSetupPage

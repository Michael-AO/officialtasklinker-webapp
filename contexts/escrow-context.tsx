"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export interface EscrowTransaction {
  id: string
  taskId: string
  taskTitle: string
  clientId: string
  clientName: string
  freelancerId: string
  freelancerName: string
  amount: number
  currency: string
  status: "pending" | "funded" | "in_progress" | "completed" | "disputed" | "released" | "refunded"
  paymentReference: string
  createdAt: string
  updatedAt: string
  releaseDate?: string
  disputeReason?: string
  milestones?: EscrowMilestone[]
}

export interface EscrowMilestone {
  id: string
  title: string
  description: string
  amount: number
  status: "pending" | "completed" | "approved" | "disputed"
  dueDate: string
  completedAt?: string
}

export interface DisputeCase {
  id: string
  escrowId: string
  raisedBy: "client" | "freelancer"
  reason: string
  description: string
  evidence: string[]
  status: "open" | "under_review" | "resolved"
  resolution?: string
  createdAt: string
  resolvedAt?: string
}

interface EscrowContextType {
  transactions: EscrowTransaction[]
  disputes: DisputeCase[]
  createEscrow: (taskId: string, amount: number, milestones?: EscrowMilestone[]) => Promise<EscrowTransaction>
  fundEscrow: (escrowId: string, paymentReference: string) => Promise<void>
  releaseFunds: (escrowId: string, milestoneId?: string) => Promise<void>
  requestRefund: (escrowId: string, reason: string) => Promise<void>
  raiseDispute: (escrowId: string, reason: string, description: string, evidence: string[]) => Promise<DisputeCase>
  resolveDispute: (disputeId: string, resolution: string) => Promise<void>
  getEscrowById: (id: string) => EscrowTransaction | undefined
  isLoading: boolean
}

const EscrowContext = createContext<EscrowContextType | undefined>(undefined)

export function EscrowProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<EscrowTransaction[]>([])
  const [disputes, setDisputes] = useState<DisputeCase[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load mock data
    const mockTransactions: EscrowTransaction[] = [
      {
        id: "esc_001",
        taskId: "task_001",
        taskTitle: "Website Redesign Project",
        clientId: "client_001",
        clientName: "Sarah Johnson",
        freelancerId: "freelancer_001",
        freelancerName: "John Doe",
        amount: 150000, // 1500 NGN in kobo
        currency: "NGN",
        status: "funded",
        paymentReference: "TL_1703123456_abc123",
        createdAt: "2024-12-01T10:00:00Z",
        updatedAt: "2024-12-01T10:30:00Z",
        milestones: [
          {
            id: "milestone_001",
            title: "Design Mockups",
            description: "Create initial design mockups and wireframes",
            amount: 50000,
            status: "completed",
            dueDate: "2024-12-10T00:00:00Z",
            completedAt: "2024-12-08T15:30:00Z",
          },
          {
            id: "milestone_002",
            title: "Frontend Development",
            description: "Implement responsive frontend",
            amount: 75000,
            status: "pending",
            dueDate: "2024-12-20T00:00:00Z",
          },
          {
            id: "milestone_003",
            title: "Testing & Deployment",
            description: "Final testing and deployment",
            amount: 25000,
            status: "pending",
            dueDate: "2024-12-25T00:00:00Z",
          },
        ],
      },
      {
        id: "esc_002",
        taskId: "task_002",
        taskTitle: "Mobile App Development",
        clientId: "client_002",
        clientName: "TechCorp Inc.",
        freelancerId: "freelancer_001",
        freelancerName: "John Doe",
        amount: 320000, // 3200 NGN in kobo
        currency: "NGN",
        status: "in_progress",
        paymentReference: "TL_1703123457_def456",
        createdAt: "2024-11-28T14:00:00Z",
        updatedAt: "2024-12-01T09:00:00Z",
      },
    ]

    const mockDisputes: DisputeCase[] = [
      {
        id: "dispute_001",
        escrowId: "esc_003",
        raisedBy: "client",
        reason: "Quality Issues",
        description: "The delivered work does not meet the agreed specifications",
        evidence: ["screenshot1.png", "requirements.pdf"],
        status: "under_review",
        createdAt: "2024-11-30T16:00:00Z",
      },
    ]

    setTransactions(mockTransactions)
    setDisputes(mockDisputes)
    setIsLoading(false)
  }, [])

  const createEscrow = async (
    taskId: string,
    amount: number,
    milestones?: EscrowMilestone[],
  ): Promise<EscrowTransaction> => {
    const newEscrow: EscrowTransaction = {
      id: `esc_${Date.now()}`,
      taskId,
      taskTitle: "New Task",
      clientId: "current_user",
      clientName: "Current User",
      freelancerId: "freelancer_id",
      freelancerName: "Freelancer Name",
      amount: amount * 100, // Convert to kobo
      currency: "NGN",
      status: "pending",
      paymentReference: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      milestones,
    }

    setTransactions((prev) => [...prev, newEscrow])
    return newEscrow
  }

  const fundEscrow = async (escrowId: string, paymentReference: string): Promise<void> => {
    setTransactions((prev) =>
      prev.map((tx) =>
        tx.id === escrowId ? { ...tx, status: "funded", paymentReference, updatedAt: new Date().toISOString() } : tx,
      ),
    )
  }

  const releaseFunds = async (escrowId: string, milestoneId?: string): Promise<void> => {
    setTransactions((prev) =>
      prev.map((tx) => {
        if (tx.id === escrowId) {
          if (milestoneId && tx.milestones) {
            const updatedMilestones = tx.milestones.map((m) =>
              m.id === milestoneId ? { ...m, status: "approved" as const } : m,
            )
            const allCompleted = updatedMilestones.every((m) => m.status === "approved")
            return {
              ...tx,
              milestones: updatedMilestones,
              status: allCompleted ? "released" : tx.status,
              updatedAt: new Date().toISOString(),
              releaseDate: allCompleted ? new Date().toISOString() : tx.releaseDate,
            }
          } else {
            return {
              ...tx,
              status: "released",
              updatedAt: new Date().toISOString(),
              releaseDate: new Date().toISOString(),
            }
          }
        }
        return tx
      }),
    )
  }

  const requestRefund = async (escrowId: string, reason: string): Promise<void> => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === escrowId ? { ...tx, status: "refunded", updatedAt: new Date().toISOString() } : tx)),
    )
  }

  const raiseDispute = async (
    escrowId: string,
    reason: string,
    description: string,
    evidence: string[],
  ): Promise<DisputeCase> => {
    const newDispute: DisputeCase = {
      id: `dispute_${Date.now()}`,
      escrowId,
      raisedBy: "client", // This would be determined by current user
      reason,
      description,
      evidence,
      status: "open",
      createdAt: new Date().toISOString(),
    }

    setDisputes((prev) => [...prev, newDispute])
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === escrowId ? { ...tx, status: "disputed", updatedAt: new Date().toISOString() } : tx)),
    )

    return newDispute
  }

  const resolveDispute = async (disputeId: string, resolution: string): Promise<void> => {
    setDisputes((prev) =>
      prev.map((dispute) =>
        dispute.id === disputeId
          ? { ...dispute, status: "resolved", resolution, resolvedAt: new Date().toISOString() }
          : dispute,
      ),
    )
  }

  const getEscrowById = (id: string): EscrowTransaction | undefined => {
    return transactions.find((tx) => tx.id === id)
  }

  return (
    <EscrowContext.Provider
      value={{
        transactions,
        disputes,
        createEscrow,
        fundEscrow,
        releaseFunds,
        requestRefund,
        raiseDispute,
        resolveDispute,
        getEscrowById,
        isLoading,
      }}
    >
      {children}
    </EscrowContext.Provider>
  )
}

export function useEscrow() {
  const context = useContext(EscrowContext)
  if (context === undefined) {
    throw new Error("useEscrow must be used within an EscrowProvider")
  }
  return context
}

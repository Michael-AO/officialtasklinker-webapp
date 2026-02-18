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

function mapApiToTransaction(acc: any): EscrowTransaction {
  return {
    id: acc.id,
    taskId: acc.taskId,
    taskTitle: acc.taskTitle,
    clientId: acc.clientId,
    clientName: acc.clientName,
    freelancerId: acc.freelancerId,
    freelancerName: acc.freelancerName,
    amount: Number(acc.amount) ?? 0,
    currency: acc.currency || "NGN",
    status: acc.status,
    paymentReference: acc.paymentReference || "",
    createdAt: acc.createdAt,
    updatedAt: acc.updatedAt,
    releaseDate: acc.releaseDate,
    disputeReason: acc.disputeReason,
    milestones: (acc.milestones || []).map((m: any) => ({
      id: m.id,
      title: m.title,
      description: m.description || "",
      amount: Number(m.amount) ?? 0,
      status: (m.status || "pending") as EscrowMilestone["status"],
      dueDate: m.dueDate || "",
      completedAt: m.completedAt,
    })),
  }
}

export function EscrowProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<EscrowTransaction[]>([])
  const [disputes, setDisputes] = useState<DisputeCase[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchEscrowList = async () => {
    try {
      const res = await fetch("/api/escrow", { credentials: "include" })
      if (!res.ok) {
        setTransactions([])
        setDisputes([])
        return
      }
      const data = await res.json()
      if (data.success && Array.isArray(data.transactions)) {
        setTransactions(data.transactions.map(mapApiToTransaction))
      }
      if (data.disputes && Array.isArray(data.disputes)) {
        setDisputes(data.disputes)
      }
    } catch (e) {
      console.error("Failed to fetch escrow list:", e)
      setTransactions([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchEscrowList()
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
    try {
      const res = await fetch("/api/escrow/release", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          escrowId,
          milestone_id: milestoneId,
          skipTransfer: true,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Release failed")
      }
      await fetchEscrowList()
    } catch (e) {
      console.error("Release funds error:", e)
      throw e
    }
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

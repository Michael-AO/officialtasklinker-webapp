"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DollarSign,
  Shield,
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
  Download,
  MessageSquare,
  ExternalLink,
} from "lucide-react"
import { useEscrow } from "@/contexts/escrow-context"
import { EscrowDetailsModal } from "@/components/escrow-details-modal"
import { PaymentModal } from "@/components/payment-modal"
import { DisputeModal } from "@/components/dispute-modal"
import { PaymentLinkModal } from "@/components/payment-link-modal"

export default function EscrowPage() {
  const { transactions, disputes, releaseFunds, raiseDispute } = useEscrow()
  const [selectedEscrow, setSelectedEscrow] = useState<string | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showPaymentLinkModal, setShowPaymentLinkModal] = useState(false)
  const [selectedEscrowForPayment, setSelectedEscrowForPayment] = useState<string | null>(null)
  const [showDisputeModal, setShowDisputeModal] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "funded":
        return "bg-blue-100 text-blue-800"
      case "in_progress":
        return "bg-purple-100 text-purple-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "disputed":
        return "bg-red-100 text-red-800"
      case "released":
        return "bg-green-100 text-green-800"
      case "refunded":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "funded":
        return <Shield className="h-4 w-4" />
      case "in_progress":
        return <Clock className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "disputed":
        return <AlertTriangle className="h-4 w-4" />
      case "released":
        return <CheckCircle className="h-4 w-4" />
      case "refunded":
        return <DollarSign className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const calculateProgress = (milestones: any[]) => {
    if (!milestones || milestones.length === 0) return 0
    const completed = milestones.filter((m) => m.status === "completed" || m.status === "approved").length
    return (completed / milestones.length) * 100
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Escrow Management</h1>
          <Button onClick={() => setShowPaymentModal(true)}>Create New Escrow</Button>
        </div>

        {/* Escrow Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total in Escrow</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₦{(transactions.reduce((sum, tx) => sum + tx.amount, 0) / 100).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">{transactions.length} active transactions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Release</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₦
                {(
                  transactions.filter((tx) => tx.status === "completed").reduce((sum, tx) => sum + tx.amount, 0) / 100
                ).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Awaiting release approval</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Disputes</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{disputes.filter((d) => d.status !== "resolved").length}</div>
              <p className="text-xs text-muted-foreground">Requiring attention</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">96%</div>
              <p className="text-xs text-muted-foreground">Successful completions</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="active" className="space-y-4">
          <TabsList>
            <TabsTrigger value="active">Active Escrows</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="disputes">Disputes</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            <div className="space-y-4">
              {transactions
                .filter((tx) => !["released", "refunded"].includes(tx.status))
                .map((escrow) => (
                  <Card key={escrow.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <Avatar>
                            <AvatarImage src="/placeholder.svg?height=40&width=40" />
                            <AvatarFallback>
                              {escrow.clientName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-lg">{escrow.taskTitle}</h3>
                              <div className="flex items-center gap-2">
                                <Badge className={getStatusColor(escrow.status)}>
                                  {getStatusIcon(escrow.status)}
                                  <span className="ml-1 capitalize">{escrow.status.replace("_", " ")}</span>
                                </Badge>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Client</p>
                                <p className="font-medium">{escrow.clientName}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Amount</p>
                                <p className="font-medium">₦{(escrow.amount / 100).toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Created</p>
                                <p className="font-medium">{new Date(escrow.createdAt).toLocaleDateString()}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Reference</p>
                                <p className="font-medium text-xs">{escrow.paymentReference || "Pending"}</p>
                              </div>
                            </div>

                            {escrow.milestones && escrow.milestones.length > 0 && (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium">Progress</p>
                                  <p className="text-sm text-muted-foreground">
                                    {
                                      escrow.milestones.filter(
                                        (m) => m.status === "completed" || m.status === "approved",
                                      ).length
                                    }{" "}
                                    of {escrow.milestones.length} milestones
                                  </p>
                                </div>
                                <Progress value={calculateProgress(escrow.milestones)} className="h-2" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-4 border-t">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => setSelectedEscrow(escrow.id)}>
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                          <Button variant="outline" size="sm">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Message
                          </Button>
                        </div>

                        <div className="flex gap-2">
                          {escrow.status === "pending" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedEscrowForPayment(escrow.id)
                                setShowPaymentLinkModal(true)
                              }}
                            >
                              <ExternalLink className="h-4 w-4 mr-1" />
                              Share Payment Link
                            </Button>
                          )}
                          {escrow.status === "completed" && (
                            <Button size="sm" onClick={() => releaseFunds(escrow.id)}>
                              Release Funds
                            </Button>
                          )}
                          {["funded", "in_progress"].includes(escrow.status) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedEscrow(escrow.id)
                                setShowDisputeModal(true)
                              }}
                            >
                              <AlertTriangle className="h-4 w-4 mr-1" />
                              Raise Dispute
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            <div className="space-y-4">
              {transactions
                .filter((tx) => ["released", "refunded"].includes(tx.status))
                .map((escrow) => (
                  <Card key={escrow.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarImage src="/placeholder.svg?height=40&width=40" />
                            <AvatarFallback>
                              {escrow.clientName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">{escrow.taskTitle}</h3>
                            <p className="text-sm text-muted-foreground">{escrow.clientName}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">₦{(escrow.amount / 100).toLocaleString()}</p>
                          <Badge className={getStatusColor(escrow.status)}>
                            {escrow.status === "released" ? "Completed" : "Refunded"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4 pt-4 border-t">
                        <p className="text-sm text-muted-foreground">
                          {escrow.status === "released" ? "Released" : "Refunded"} on{" "}
                          {escrow.releaseDate ? new Date(escrow.releaseDate).toLocaleDateString() : "N/A"}
                        </p>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Receipt
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="disputes" className="space-y-4">
            <div className="space-y-4">
              {disputes.map((dispute) => {
                const escrow = transactions.find((tx) => tx.id === dispute.escrowId)
                return (
                  <Card key={dispute.id}>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{escrow?.taskTitle}</h3>
                            <p className="text-sm text-muted-foreground">
                              Raised by {dispute.raisedBy} • {new Date(dispute.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className={getStatusColor(dispute.status)}>{dispute.status.replace("_", " ")}</Badge>
                        </div>

                        <div>
                          <p className="font-medium text-sm">Reason: {dispute.reason}</p>
                          <p className="text-sm text-muted-foreground mt-1">{dispute.description}</p>
                        </div>

                        {dispute.evidence.length > 0 && (
                          <div>
                            <p className="font-medium text-sm mb-2">Evidence:</p>
                            <div className="flex gap-2">
                              {dispute.evidence.map((file, index) => (
                                <Badge key={index} variant="outline">
                                  {file}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {dispute.resolution && (
                          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                            <p className="font-medium text-sm text-green-800">Resolution:</p>
                            <p className="text-sm text-green-700">{dispute.resolution}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Modals */}
        {selectedEscrow && (
          <EscrowDetailsModal
            escrowId={selectedEscrow}
            isOpen={!!selectedEscrow}
            onClose={() => setSelectedEscrow(null)}
          />
        )}

        <PaymentModal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} />

        {selectedEscrow && (
          <DisputeModal
            escrowId={selectedEscrow}
            isOpen={showDisputeModal}
            onClose={() => {
              setShowDisputeModal(false)
              setSelectedEscrow(null)
            }}
          />
        )}

        {selectedEscrowForPayment && (
          <PaymentLinkModal
            escrowId={selectedEscrowForPayment}
            isOpen={showPaymentLinkModal}
            onClose={() => {
              setShowPaymentLinkModal(false)
              setSelectedEscrowForPayment(null)
            }}
            escrowData={
              transactions.find((tx) => tx.id === selectedEscrowForPayment) || {
                taskTitle: "",
                clientName: "",
                clientEmail: "",
                amount: 0,
              }
            }
          />
        )}
      </div>
    </div>
  )
}

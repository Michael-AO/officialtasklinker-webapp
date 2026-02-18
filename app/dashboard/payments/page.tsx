"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, Shield, CheckCircle } from "lucide-react"
import { NairaIcon } from "@/components/naira-icon"
import { formatNaira } from "@/lib/currency"

interface Stats {
  totalEarnings: number
}

interface EscrowItem {
  id: string
  taskId: string
  taskTitle: string
  clientName: string
  freelancerName: string
  amount: number
  status: string
  updatedAt: string
}

export default function PaymentsPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [escrowList, setEscrowList] = useState<EscrowItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [statsRes, escrowRes] = await Promise.all([
          fetch("/api/user/stats", { credentials: "include" }),
          fetch("/api/escrow", { credentials: "include" }),
        ])
        if (statsRes.ok) {
          const statsData = await statsRes.json()
          if (statsData.success && statsData.data) {
            setStats({
              totalEarnings: statsData.data.totalEarnings ?? 0,
            })
          }
        }
        if (escrowRes.ok) {
          const escrowData = await escrowRes.json()
          if (escrowData.success && Array.isArray(escrowData.transactions)) {
            setEscrowList(escrowData.transactions)
          }
        }
      } catch (e) {
        console.error("Payments fetch error:", e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const inEscrow = escrowList.filter((t) => t.status !== "released" && t.status !== "refunded")
  const inEscrowTotal = inEscrow.reduce((sum, t) => sum + Number(t.amount), 0)
  const completedPayments = escrowList.filter((t) => t.status === "released")
  const totalEarnings = stats?.totalEarnings ?? 0
  const available = Math.max(0, totalEarnings - inEscrowTotal)

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    } catch {
      return iso
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Payments & Escrow (Naira)</h1>
        <Button asChild>
          <Link href="/dashboard/payments/withdrawals">Request Withdrawal</Link>
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">All amounts are in Nigerian Naira (₦)</p>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">Loading...</CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">Loading...</CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">Loading...</CardContent>
          </Card>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                <NairaIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNaira(totalEarnings)}</div>
                <p className="text-xs text-muted-foreground">Lifetime earnings</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Escrow</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNaira(inEscrowTotal)}</div>
                <p className="text-xs text-muted-foreground">{inEscrow.length} active payment(s)</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNaira(available)}</div>
                <p className="text-xs text-muted-foreground">Ready for withdrawal</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="escrow" className="space-y-4">
            <TabsList>
              <TabsTrigger value="escrow">Escrow Payments</TabsTrigger>
              <TabsTrigger value="completed">Payment History</TabsTrigger>
            </TabsList>

            <TabsContent value="escrow" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Active Escrow Payments</CardTitle>
                  <CardDescription>Payments currently held in escrow for ongoing projects</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {inEscrow.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4">No active escrow payments.</p>
                  ) : (
                    inEscrow.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                            <Shield className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="space-y-1">
                            <p className="font-medium">{payment.taskTitle}</p>
                            <p className="text-sm text-muted-foreground">
                              Client: {payment.clientName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Payment held in escrow until project completion (Naira)
                            </p>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="text-lg font-bold">{formatNaira(Number(payment.amount))}</p>
                          <Badge variant={payment.status === "funded" ? "secondary" : "outline"}>
                            {payment.status === "funded" ? "In Escrow" : payment.status}
                          </Badge>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />
                            Updated: {formatDate(payment.updatedAt)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Payment History</CardTitle>
                  <CardDescription>Your completed payments and transaction history</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {completedPayments.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4">No completed payments yet.</p>
                  ) : (
                    completedPayments.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="space-y-1">
                            <p className="font-medium">{payment.taskTitle}</p>
                            <p className="text-sm text-muted-foreground">
                              Client: {payment.clientName}
                            </p>
                            <p className="text-xs text-muted-foreground">Payment successfully released</p>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="text-lg font-bold">{formatNaira(Number(payment.amount))}</p>
                          <Badge variant="default" className="bg-green-600">
                            Completed
                          </Badge>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />
                            {formatDate(payment.updatedAt)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}

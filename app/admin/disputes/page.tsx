"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Scale, ArrowLeft, Calendar, User, FileText, ExternalLink } from "lucide-react"

interface Dispute {
  id: string
  milestone_id: string
  raised_by: string
  reason: string
  status: string
  evidence_urls: string[] | null
  admin_verdict: unknown
  created_at: string
  resolved_at: string | null
  milestone?: { id: string; task_id: string; title: string; amount: number } | null
  raised_by_user?: { id: string; name: string; email: string } | null
}

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDisputes()
  }, [])

  const fetchDisputes = async () => {
    try {
      const res = await fetch("/api/admin/disputes", { credentials: "include" })
      const data = await res.json()
      if (data.success) setDisputes(data.disputes || [])
    } catch (e) {
      console.error("Failed to fetch disputes:", e)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN":
        return "bg-amber-100 text-amber-800"
      case "NEGOTIATING":
        return "bg-blue-100 text-blue-800"
      case "ARBITRATION":
        return "bg-orange-100 text-orange-800"
      case "RESOLVED":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Disputes</h1>
        </div>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Loading disputes...
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Scale className="h-8 w-8" />
            Disputes
          </h1>
        </div>
        <Button variant="outline" onClick={fetchDisputes}>
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Disputes</CardTitle>
          <p className="text-sm text-muted-foreground">
            Milestone disputes raised by freelancers. Resolve from support or external process.
          </p>
        </CardHeader>
        <CardContent>
          {disputes.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">No disputes yet.</p>
          ) : (
            <div className="space-y-4">
              {disputes.map((d) => (
                <div
                  key={d.id}
                  className="rounded-lg border p-4 space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={getStatusColor(d.status)}>{d.status}</Badge>
                      <span className="text-xs text-muted-foreground">ID: {d.id.slice(0, 8)}…</span>
                      {d.milestone && (
                        <Link href={`/dashboard/tasks/${d.milestone.task_id}`}>
                          <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                            Task: {d.milestone.task_id.slice(0, 8)}…
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </Button>
                        </Link>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {new Date(d.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>
                      Raised by: {d.raised_by_user?.name ?? "Unknown"} ({d.raised_by_user?.email ?? d.raised_by})
                    </span>
                  </div>
                  {d.milestone && (
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>Milestone: {d.milestone.title} — ₦{Number(d.milestone.amount).toLocaleString()}</span>
                    </div>
                  )}
                  <p className="text-sm"><strong>Reason:</strong> {d.reason}</p>
                  {d.evidence_urls && d.evidence_urls.length > 0 && (
                    <div className="text-sm">
                      <strong>Evidence:</strong>{" "}
                      {d.evidence_urls.map((url, i) => (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline mr-2"
                        >
                          Evidence {i + 1}
                        </a>
                      ))}
                    </div>
                  )}
                  {d.admin_verdict != null && (
                    <p className="text-sm text-muted-foreground">
                      <strong>Verdict:</strong> {JSON.stringify(d.admin_verdict)}
                    </p>
                  )}
                  {d.resolved_at && (
                    <p className="text-xs text-muted-foreground">
                      Resolved: {new Date(d.resolved_at).toLocaleString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

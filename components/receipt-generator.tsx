"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Download, FileText } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface ReceiptData {
  id: string
  type: "escrow" | "withdrawal"
  amount: number
  fee?: number
  netAmount?: number
  status: string
  date: string
  reference: string
  description: string
  clientName?: string
  bankAccount?: {
    bankName: string
    accountNumber: string
    accountName: string
  }
}

interface ReceiptGeneratorProps {
  data: ReceiptData
  onDownload?: () => void
}

export function ReceiptGenerator({ data, onDownload }: ReceiptGeneratorProps) {
  const generatePDF = async () => {
    try {
      const response = await fetch("/api/receipts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("Failed to generate receipt")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `receipt-${data.reference}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Receipt Downloaded",
        description: "Your receipt has been downloaded successfully.",
      })

      onDownload?.()
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to generate receipt. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Transaction Receipt
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Type:</span>
            <Badge variant="outline">{data.type === "escrow" ? "Escrow Payment" : "Withdrawal"}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Reference:</span>
            <span className="text-sm font-mono">{data.reference}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Date:</span>
            <span className="text-sm">{new Date(data.date).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Status:</span>
            <Badge className="capitalize">{data.status}</Badge>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Amount:</span>
            <span className="font-semibold">₦{(data.amount / 100).toLocaleString()}</span>
          </div>
          {data.fee && (
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Fee:</span>
              <span className="text-sm">₦{(data.fee / 100).toLocaleString()}</span>
            </div>
          )}
          {data.netAmount && (
            <div className="flex justify-between font-semibold">
              <span>Net Amount:</span>
              <span className="text-green-600">₦{(data.netAmount / 100).toLocaleString()}</span>
            </div>
          )}
        </div>

        {data.clientName && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Client:</span>
                <span className="text-sm">{data.clientName}</span>
              </div>
            </div>
          </>
        )}

        {data.bankAccount && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Bank:</span>
                <span className="text-sm">{data.bankAccount.bankName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Account:</span>
                <span className="text-sm">
                  {data.bankAccount.accountName} - ***{data.bankAccount.accountNumber.slice(-4)}
                </span>
              </div>
            </div>
          </>
        )}

        <Button onClick={generatePDF} className="w-full">
          <Download className="h-4 w-4 mr-2" />
          Download Receipt
        </Button>
      </CardContent>
    </Card>
  )
}

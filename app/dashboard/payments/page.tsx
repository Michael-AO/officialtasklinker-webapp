import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, Shield, CheckCircle } from "lucide-react"
import { NairaIcon } from "@/components/naira-icon"

export default function PaymentsPage() {
  const escrowPayments = [
    {
      id: 1,
      taskTitle: "Website Redesign Project",
      client: "Sarah Johnson",
      amount: "$1,500",
      status: "In Escrow",
      dueDate: "Dec 15, 2024",
      description: "Payment held in escrow until project completion",
    },
    {
      id: 2,
      taskTitle: "Mobile App Development",
      client: "TechCorp Inc.",
      amount: "$3,200",
      status: "Pending Release",
      dueDate: "Dec 20, 2024",
      description: "Awaiting client approval for payment release",
    },
  ]

  const completedPayments = [
    {
      id: 1,
      taskTitle: "Logo Design",
      client: "StartupXYZ",
      amount: "$450",
      status: "Completed",
      completedDate: "Dec 1, 2024",
      description: "Payment successfully released",
    },
    {
      id: 2,
      taskTitle: "Content Writing",
      client: "BlogCorp",
      amount: "$280",
      status: "Completed",
      completedDate: "Nov 28, 2024",
      description: "Payment successfully released",
    },
    {
      id: 3,
      taskTitle: "Social Media Graphics",
      client: "Marketing Pro",
      amount: "$320",
      status: "Completed",
      completedDate: "Nov 25, 2024",
      description: "Payment successfully released",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Payments & Escrow</h1>
        <Button>Request Withdrawal</Button>
      </div>

      {/* Payment Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <NairaIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$8,450</div>
            <p className="text-xs text-muted-foreground">+$1,200 this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Escrow</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$4,700</div>
            <p className="text-xs text-muted-foreground">2 active payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$3,750</div>
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
              {escrowPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                      <Shield className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium">{payment.taskTitle}</p>
                      <p className="text-sm text-muted-foreground">Client: {payment.client}</p>
                      <p className="text-xs text-muted-foreground">{payment.description}</p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-lg font-bold">{payment.amount}</p>
                    <Badge variant={payment.status === "In Escrow" ? "secondary" : "outline"}>{payment.status}</Badge>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      Due: {payment.dueDate}
                    </p>
                  </div>
                </div>
              ))}
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
              {completedPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium">{payment.taskTitle}</p>
                      <p className="text-sm text-muted-foreground">Client: {payment.client}</p>
                      <p className="text-xs text-muted-foreground">{payment.description}</p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-lg font-bold">{payment.amount}</p>
                    <Badge variant="default" className="bg-green-600">
                      {payment.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      {payment.completedDate}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

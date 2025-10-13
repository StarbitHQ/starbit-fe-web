import { NavHeader } from "@/components/nav-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle2, Clock, XCircle, Download } from "lucide-react"

export default function HistoryPage() {
  const trades = [
    {
      id: 1,
      date: "2025-01-15 14:30",
      coin: "BTC",
      type: "buy",
      amount: "0.05",
      price: "$45,250",
      total: "$2,262.50",
      status: "completed",
      trader: "CryptoKing",
    },
    {
      id: 2,
      date: "2025-01-14 10:15",
      coin: "ETH",
      type: "sell",
      amount: "1.2",
      price: "$2,850",
      total: "$3,420.00",
      status: "completed",
      trader: "TraderPro",
    },
    {
      id: 3,
      date: "2025-01-13 16:45",
      coin: "BTC",
      type: "buy",
      amount: "0.03",
      price: "$45,180",
      total: "$1,355.40",
      status: "pending",
      trader: "BitMaster",
    },
    {
      id: 4,
      date: "2025-01-12 09:20",
      coin: "XRP",
      type: "sell",
      amount: "500",
      price: "$0.62",
      total: "$310.00",
      status: "completed",
      trader: "CoinDealer",
    },
    {
      id: 5,
      date: "2025-01-11 13:00",
      coin: "ETH",
      type: "buy",
      amount: "0.8",
      price: "$2,845",
      total: "$2,276.00",
      status: "cancelled",
      trader: "EthTrader",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Completed
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-secondary/10 text-secondary hover:bg-secondary/20 gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        )
      case "cancelled":
        return (
          <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/20 gap-1">
            <XCircle className="h-3 w-3" />
            Cancelled
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <NavHeader isAuthenticated />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Trading History</h1>
          <p className="text-muted-foreground">View all your past trades and transactions</p>
        </div>

        {/* Filters */}
        <Card className="mb-6 bg-card border-border">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 grid gap-4 md:grid-cols-3">
                <Select defaultValue="all">
                  <SelectTrigger className="bg-background border-input text-foreground">
                    <SelectValue placeholder="All Coins" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Coins</SelectItem>
                    <SelectItem value="btc">Bitcoin (BTC)</SelectItem>
                    <SelectItem value="eth">Ethereum (ETH)</SelectItem>
                    <SelectItem value="xrp">Ripple (XRP)</SelectItem>
                  </SelectContent>
                </Select>

                <Select defaultValue="all">
                  <SelectTrigger className="bg-background border-input text-foreground">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="buy">Buy</SelectItem>
                    <SelectItem value="sell">Sell</SelectItem>
                  </SelectContent>
                </Select>

                <Select defaultValue="all">
                  <SelectTrigger className="bg-background border-input text-foreground">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Trades Table */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">All Trades</CardTitle>
            <CardDescription className="text-muted-foreground">Complete history of your transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Coin</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Price</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Total</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Trader</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.map((trade) => (
                    <tr key={trade.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="py-4 px-4 text-sm text-muted-foreground">{trade.date}</td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className="font-mono">
                          {trade.coin}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Badge
                          className={
                            trade.type === "buy"
                              ? "bg-primary/10 text-primary hover:bg-primary/20"
                              : "bg-secondary/10 text-secondary hover:bg-secondary/20"
                          }
                        >
                          {trade.type.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-sm text-foreground font-medium">{trade.amount}</td>
                      <td className="py-4 px-4 text-sm text-foreground">{trade.price}</td>
                      <td className="py-4 px-4 text-sm text-foreground font-semibold">{trade.total}</td>
                      <td className="py-4 px-4 text-sm text-muted-foreground">{trade.trader}</td>
                      <td className="py-4 px-4">{getStatusBadge(trade.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

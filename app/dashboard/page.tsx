import { NavHeader } from "@/components/nav-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  Users,
  Shield,
  MessageSquare,
  ArrowRight,
  Bitcoin,
  DollarSign,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  // Mock data
  const dailyCoins = [
    { name: "Bitcoin", symbol: "BTC", price: "$45,234.56", change: "+2.4%", positive: true },
    { name: "Ethereum", symbol: "ETH", price: "$2,845.12", change: "+1.8%", positive: true },
    { name: "Ripple", symbol: "XRP", price: "$0.6234", change: "-0.5%", positive: false },
  ]

  const stats = [
    { label: "Total Trades", value: "24", icon: Activity, color: "text-primary" },
    { label: "Active Offers", value: "3", icon: TrendingUp, color: "text-secondary" },
    { label: "Referrals", value: "12", icon: Users, color: "text-primary" },
    { label: "Total Volume", value: "$12.5K", icon: DollarSign, color: "text-secondary" },
  ]

  const recentTrades = [
    { id: 1, coin: "BTC", amount: "0.05", status: "completed", date: "2 hours ago" },
    { id: 2, coin: "ETH", amount: "1.2", status: "pending", date: "5 hours ago" },
    { id: 3, coin: "XRP", amount: "500", status: "completed", date: "1 day ago" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <NavHeader isAuthenticated />

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back, Alex</h1>
          <p className="text-muted-foreground">Here's what's happening with your trading today</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label} className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg bg-${stat.color}/10`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Daily Trading Coins */}
          <Card className="lg:col-span-2 bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Bitcoin className="h-5 w-5 text-primary" />
                Daily Trading Coins
              </CardTitle>
              <CardDescription className="text-muted-foreground">Top performing coins today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dailyCoins.map((coin) => (
                  <div key={coin.symbol} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">{coin.symbol[0]}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{coin.name}</p>
                        <p className="text-sm text-muted-foreground">{coin.symbol}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">{coin.price}</p>
                      <p className={`text-sm ${coin.positive ? "text-primary" : "text-destructive"}`}>{coin.change}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/p2p">
                <Button className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                  Start Trading
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Quick Actions</CardTitle>
              <CardDescription className="text-muted-foreground">Navigate to key features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/p2p">
                <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  P2P Trading
                </Button>
              </Link>
              <Link href="/referral">
                <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                  <Users className="h-4 w-4 text-secondary" />
                  Referral Program
                </Button>
              </Link>
              <Link href="/kyc">
                <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                  <Shield className="h-4 w-4 text-primary" />
                  KYC Verification
                </Button>
              </Link>
              <Link href="/support">
                <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                  <MessageSquare className="h-4 w-4 text-secondary" />
                  Support Tickets
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Trades */}
        <Card className="mt-6 bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Trades</CardTitle>
            <CardDescription className="text-muted-foreground">Your latest trading activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTrades.map((trade) => (
                <div key={trade.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    {trade.status === "completed" ? (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    ) : trade.status === "pending" ? (
                      <Clock className="h-5 w-5 text-secondary" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive" />
                    )}
                    <div>
                      <p className="font-semibold text-foreground">
                        {trade.coin} - {trade.amount}
                      </p>
                      <p className="text-sm text-muted-foreground">{trade.date}</p>
                    </div>
                  </div>
                  <Badge
                    variant={trade.status === "completed" ? "default" : "secondary"}
                    className={
                      trade.status === "completed"
                        ? "bg-primary/10 text-primary hover:bg-primary/20"
                        : "bg-secondary/10 text-secondary hover:bg-secondary/20"
                    }
                  >
                    {trade.status}
                  </Badge>
                </div>
              ))}
            </div>
            <Link href="/history">
              <Button variant="outline" className="w-full mt-4 bg-transparent">
                View All Trades
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

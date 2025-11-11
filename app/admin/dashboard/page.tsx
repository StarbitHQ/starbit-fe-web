"use client";

import { NavHeader } from "@/components/admin-nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { API_BASE_URL } from "@/lib/api";
import {
  Users,
  DollarSign,
  Activity,
  TrendingUp,
  Bitcoin,
  ArrowRight,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Loader2,
  PieChart,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any[]>([]);
  const [dailyCoins, setDailyCoins] = useState<any[]>([]);
  const [recentTrades, setRecentTrades] = useState<any[]>([]);
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdminDashboardData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const authToken = Cookies.get("auth_token");
        if (!authToken) {
          setError("Please log in as an admin to view the dashboard");
          return;
        }

        // Fetch admin dashboard stats
        const dashboardResponse = await fetch(`${API_BASE_URL}/api/admin/dashboard`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (!dashboardResponse.ok) {
          throw new Error("Failed to fetch admin dashboard data");
        }

        const dashboardData = await dashboardResponse.json();
        if (!dashboardData.success) {
          throw new Error(dashboardData.message || "Failed to load admin dashboard data");
        }

        // Fetch trading pairs stats
        const tradingPairsResponse = await fetch(`${API_BASE_URL}/api/admin/trading-pairs/stats`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (!tradingPairsResponse.ok) {
          throw new Error("Failed to fetch trading pairs stats");
        }

        const tradingPairsData = await tradingPairsResponse.json();
        if (!tradingPairsData.success) {
          throw new Error(tradingPairsData.message || "Failed to load trading pairs stats");
        }

        // Fetch active users
        // const activeUsersResponse = await fetch(`${API_BASE_URL}/api/admin/active-users`, {
        //   method: "GET",
        //   headers: {
        //     "Content-Type": "application/json",
        //     Authorization: `Bearer ${authToken}`,
        //   },
        // });

        // if (!activeUsersResponse.ok) {
        //   throw new Error("Failed to fetch active users");
        // }

        // const activeUsersData = await activeUsersResponse.json();
        // if (!activeUsersData.success) {
        //   throw new Error(activeUsersData.message || "Failed to load active users");
        // }

        // Set stats
        setStats([
          { label: "Total Users", value: dashboardData.data.total_users, icon: Users, color: "text-primary" },
          { label: "Total Deposits", value: `$${dashboardData.data.total_deposits}`, icon: DollarSign, color: "text-secondary" },
          { label: "Total Trades", value: dashboardData.data.total_trades, icon: Activity, color: "text-primary" },
          { label: "Total Volume", value: `$${dashboardData.data.total_volume}`, icon: DollarSign, color: "text-secondary" },
          { label: "Active Trading Pairs", value: tradingPairsData.data.active_pairs, icon: TrendingUp, color: "text-primary" },
          { label: "Avg Min Investment", value: `$${tradingPairsData.data.avg_min_investment}`, icon: DollarSign, color: "text-secondary" },
          { label: "Avg Return %", value: `${tradingPairsData.data.avg_return_percentage}%`, icon: PieChart, color: "text-primary" },
        ]);

        // Set active users
        // setActiveUsers(activeUsersData.data);

        // Fetch daily coins (top 5 coins by 24h price change)
        const coinsResponse = await Promise.all(
          ["bitcoin", "ethereum", "tether", "binancecoin", "solana"].map(async (coinId) => {
            const response = await fetch(`${API_BASE_URL}/api/admin/verify-coin/${coinId}`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
              },
            });
            if (!response.ok) return null;
            const data = await response.json();
            return data.success ? data.data : null;
          })
        );

        setDailyCoins(
          coinsResponse
            .filter((coin) => coin !== null)
            .map((coin) => ({
              name: coin.name,
              symbol: coin.symbol,
              price: `$${coin.current_price?.toFixed(2) || "N/A"}`,
              change: `${coin.price_change_percentage_24h?.toFixed(2) || "0"}%`,
              positive: (coin.price_change_percentage_24h || 0) >= 0,
              image: coin.image || "/placeholder-coin.png", // Fallback image
            }))
        );

        // Fetch recent trades (example: from a specific trading pair or a new endpoint)
        const recentTradesResponse = await fetch(`${API_BASE_URL}/api/admin/trading-pairs/1/trades`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (recentTradesResponse.ok) {
          const tradesData = await recentTradesResponse.json();
          if (tradesData.success) {
            setRecentTrades(
              tradesData.data.trades.map((trade: any) => ({
                id: trade.id,
                // coin: `${trade.trading_pair.base_symbol}/${trade.trading_pair.quote_symbol}`,
                amount: `$${trade.amount}`,
                date: new Date(trade.created_at).toLocaleDateString(),
                status: trade.status,
              }))
            );
          }
        }
      } catch (err: any) {
        setError(err.message || "Network error. Please check your connection and try again.");
        console.error("Error fetching admin dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavHeader isAuthenticated />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Overview of platform activity and statistics</p>
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
                Top Performing Coins
              </CardTitle>
              <CardDescription className="text-muted-foreground">Coins with highest 24h price change</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dailyCoins.map((coin) => (
                  <div key={coin.symbol} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <img src={coin.image} alt={coin.name} className="h-10 w-10 rounded-full object-cover" />
                      <div>
                        <p className="font-semibold text-foreground">{coin.name}</p>
                        <p className="text-sm text-muted-foreground">{coin.symbol}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">{coin.price}</p>
                      <p className={`text-sm ${coin.positive ? "text-primary" : "text-destructive"}`}>
                        {coin.change}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Admin Actions</CardTitle>
              <CardDescription className="text-muted-foreground">Manage platform features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/admin/users">
                <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                  <Users className="h-4 w-4 text-primary" />
                  Manage Users
                </Button>
              </Link>
              <Link href="/admin/trading-pairs">
                <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                  <TrendingUp className="h-4 w-4 text-secondary" />
                  Manage Trading Pairs
                </Button>
              </Link>
              <Link href="/admin/deposits">
                <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                  <DollarSign className="h-4 w-4 text-primary" />
                  View Deposits
                </Button>
              </Link>
              <Link href="/admin/trades">
                <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                  <Activity className="h-4 w-4 text-secondary" />
                  View Trades
                </Button>
              </Link>
              <Link href="/admin/support">
                <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                  {/* <MessageSquare className="h-4 w-4 text-primary" /> */}
                  Support Tickets
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Active Users */}
        {/* <Card className="mt-6 bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Active Users</CardTitle>
            <CardDescription className="text-muted-foreground">Users with active trades</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeUsers.map((user: any) => (
                <div key={user.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-semibold text-foreground">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <Badge variant="default" className="bg-primary/10 text-primary hover:bg-primary/20">
                    {user.active_trades_count} Active Trades
                  </Badge>
                </div>
              ))}
            </div>
            <Link href="/admin/users">
              <Button variant="outline" className="w-full mt-4 bg-transparent">
                View All Users
              </Button>
            </Link>
          </CardContent>
        </Card> */}

        {/* Recent Trades */}
        <Card className="mt-6 bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Trades</CardTitle>
            <CardDescription className="text-muted-foreground">Latest platform trading activity</CardDescription>
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
            <Link href="/admin/trades">
              <Button variant="outline" className="w-full mt-4 bg-transparent">
                View All Trades
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
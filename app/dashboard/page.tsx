"use client";

import { NavHeader } from "@/components/nav-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { API_BASE_URL } from "@/lib/api"

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
  Wallet,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Image from "next/image";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [dailyCoins, setDailyCoins] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [recentTrades, setRecentTrades] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const authToken = Cookies.get("auth_token");
        if (!authToken) {
          setError("Please log in to view your dashboard");
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/dashboard`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const data = await response.json();
        if (data.success) {
          setUser(data.data.user);
          setDailyCoins(data.data.daily_coins);
          setRecentTrades(data.data.recent_trades);
          setStats([
            { label: "Total Trades", value: data.data.stats.total_trades, icon: Activity, color: "text-primary" },
            { label: "Referrals", value: data.data.stats.referrals, icon: Users, color: "text-primary" },
            { label: "Total Volume", value: `$${parseFloat(data.data.stats.total_volume).toFixed(2)}`, icon: DollarSign, color: "text-secondary" },
          ]);

          // Update cookies with latest user data
          Cookies.set("user_data", JSON.stringify(data.data.user));
        } else {
          setError(data.message || "Failed to load dashboard data");
        }
      } catch (err) {
        setError("Network error. Please check your connection and try again.");
        console.error("Error fetching dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
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
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {user?.name || "User"}
          </h1>
          <p className="text-muted-foreground">Here's what's happening with your trading today</p>
          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              <p className="text-lg font-semibold text-foreground">
                Balance: {user?.balance ? `$${user.balance}` : "$0.00"}
              </p>
            </div>
            {user?.referral_code && (
              <Badge variant="outline" className="bg-primary/10 text-primary">
                Referral Code: {user.referral_code}
              </Badge>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
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
              <CardDescription className="text-muted-foreground">
                Biggest gainers in the last 24 hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dailyCoins.map((coin) => (
                  <div key={coin.symbol} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                    <div className="flex items-center gap-3">
                      {/* CoinGecko Image */}
                      <div className="relative h-10 w-10 rounded-full overflow-hidden bg-background flex-shrink-0">
                        {coin.image ? (
                          <Image
                            src={coin.image}
                            alt={coin.name}
                            width={40}
                            height={40}
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="h-full w-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-bold text-primary">
                              {coin.symbol[0]}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{coin.name}</p>
                        <p className="text-sm text-muted-foreground">{coin.symbol}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">{coin.price}</p>
                      <p className={`text-sm font-medium ${coin.positive ? "text-green-600" : "text-red-600"}`}>
                        {coin.change}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/trade">
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
              <Link href="/deposit">
                <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                  <DollarSign className="h-4 w-4 text-primary" />
                  Deposit
                </Button>
              </Link>
              <Link href="/withdraw">
                <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                  <DollarSign className="h-4 w-4 text-secondary" />
                  Withdraw
                </Button>
              </Link>
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
            {recentTrades.length > 0 ? (
              <>
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
                            {trade.amount}
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
              </>
            ) : (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground mb-4">No trades yet</p>
                <Link href="/p2p">
                  <Button variant="default">Start Trading</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
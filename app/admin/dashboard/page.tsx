// app/admin/dashboard/page.tsx
"use client";

import { NavHeader } from "@/components/admin-nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { API_BASE_URL } from "@/lib/api";
import {
  Users, DollarSign, Activity, TrendingUp, Bitcoin,
  CheckCircle2, Clock, XCircle, AlertCircle, Loader2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any[]>([]);
  const [dailyCoins, setDailyCoins] = useState<any[]>([]);
  const [recentTrades, setRecentTrades] = useState<any[]>([]);
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

        // ────── DASHBOARD STATS ──────
        const dashboardRes = await fetch(`${API_BASE_URL}/api/admin/dashboard`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const dashboardData = await dashboardRes.json();
        if (!dashboardData.success) throw new Error(dashboardData.message);

        // ────── TRADING PAIRS STATS ──────
        const pairsRes = await fetch(`${API_BASE_URL}/api/admin/trading-pairs/stats`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const pairsData = await pairsRes.json();
        if (!pairsData.success) throw new Error(pairsData.message);

        // ────── SET STATS ──────
        setStats([
          { label: "Total Users", value: dashboardData.data.total_users, icon: Users, color: "text-primary" },
          { label: "Total Deposits", value: `$${dashboardData.data.total_deposits}`, icon: DollarSign, color: "text-secondary" },
          { label: "Total Trades", value: dashboardData.data.total_trades, icon: Activity, color: "text-primary" },
          { label: "Active Trading Pairs", value: pairsData.data.active_pairs, icon: TrendingUp, color: "text-primary" },
        ]);

        // ────── DAILY COINS (unchanged) ──────
        const coins = await Promise.all(
          ["bitcoin", "ethereum", "tether", "binancecoin", "solana"].map(async (id) => {
            const r = await fetch(`${API_BASE_URL}/api/admin/verify-coin/${id}`, {
              headers: { Authorization: `Bearer ${authToken}` },
            });
            if (!r.ok) return null;
            const d = await r.json();
            return d.success ? d.data : null;
          })
        );

        setDailyCoins(
          coins
            .filter(Boolean)
            .map((c: any) => ({
              name: c.name,
              symbol: c.symbol,
              price: `$${c.current_price?.toFixed(2) ?? "N/A"}`,
              change: `${c.price_change_percentage_24h?.toFixed(2) ?? "0"}%`,
              positive: (c.price_change_percentage_24h ?? 0) >= 0,
              image: c.image ?? "/placeholder-coin.png",
            }))
        );

        // ────── RECENT TRADES (fixed) ──────
        const tradesRes = await fetch(`${API_BASE_URL}/api/admin/get-recent-trades`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        if (tradesRes.ok) {
          const tradesJson = await tradesRes.json();

          if (tradesJson.success && Array.isArray(tradesJson.data)) {
            setRecentTrades(
              tradesJson.data.map((t: any) => ({
                id: t.id,
                amount: `$${parseFloat(t.investment_amount).toFixed(2)}`,
                status: t.status,
                date: new Date(t.created_at).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                }),
                // optional: show pair name from notes
                coin: t.notes?.match(/Investment in (.*?) \(/)?.[1] ?? "BTC/USDT",
              }))
            );
          } else {
            setRecentTrades([]);
          }
        } else {
          setRecentTrades([]);
        }
      } catch (err: any) {
        setError(err.message ?? "Network error");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminDashboardData();
  }, []);

  // ────── UI ──────
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
            <Button onClick={() => location.reload()}>Try Again</Button>
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
          {stats.map((s) => (
            <Card key={s.label} className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{s.label}</p>
                    <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg bg-${s.color.split("-")[1]}/10`}>
                    <s.icon className={`h-6 w-6 ${s.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Top Coins */}
          <Card className="lg:col-span-2 bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Bitcoin className="h-5 w-5 text-primary" />
                Top Performing Coins
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Coins with highest 24h price change
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dailyCoins.map((c) => (
                  <div key={c.symbol} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <img src={c.image} alt={c.name} className="h-10 w-10 rounded-full object-cover" />
                      <div>
                        <p className="font-semibold text-foreground">{c.name}</p>
                        <p className="text-sm text-muted-foreground">{c.symbol}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">{c.price}</p>
                      <p className={`text-sm ${c.positive ? "text-primary" : "text-destructive"}`}>
                        {c.change}
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
              <Link href="/admin/users"><Button variant="outline" className="w-full justify-start gap-2"><Users className="h-4 w-4 text-primary" />Manage Users</Button></Link>
              <Link href="/admin/trading-pairs"><Button variant="outline" className="w-full justify-start gap-2"><TrendingUp className="h-4 w-4 text-secondary" />Manage Trading Pairs</Button></Link>
              <Link href="/admin/deposits"><Button variant="outline" className="w-full justify-start gap-2"><DollarSign className="h-4 w-4 text-primary" />View Deposits</Button></Link>
              <Link href="/admin/trades"><Button variant="outline" className="w-full justify-start gap-2"><Activity className="h-4 w-4 text-secondary" />View Trades</Button></Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Trades */}
        <Card className="mt-6 bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Trades</CardTitle>
            <CardDescription className="text-muted-foreground">Latest platform trading activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTrades.length > 0 ? (
                recentTrades.map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      {t.status === "active" ? (
                        <Clock className="h-5 w-5 text-secondary" />
                      ) : t.status === "completed" ? (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive" />
                      )}
                      <div>
                        <p className="font-semibold text-foreground">
                          {t.coin} - {t.amount}
                        </p>
                        <p className="text-sm text-muted-foreground">{t.date}</p>
                      </div>
                    </div>
                    <Badge
                      variant={t.status === "completed" ? "default" : "secondary"}
                      className={
                        t.status === "completed"
                          ? "bg-primary/10 text-primary hover:bg-primary/20"
                          : "bg-secondary/10 text-secondary hover:bg-secondary/20"
                      }
                    >
                      {t.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">No trades today</p>
              )}
            </div>

            <Link href="/admin/trades">
              <Button variant="outline" className="w-full mt-4">View All Trades</Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
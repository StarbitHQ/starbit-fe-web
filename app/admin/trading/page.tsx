"use client";

import { API_BASE_URL } from "@/lib/api";
import { NavHeader } from "@/components/nav-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, DollarSign, TrendingUp, Activity, CheckCircle2, Clock, Users, Shield, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import Cookies from "js-cookie";

interface TradingPair {
  id: number;
  coingecko_id: string;
  base_symbol: string;
  base_name: string;
  quote_symbol: string;
  base_icon_url: string | null;
  min_investment: number;
  max_investment: number;
  min_return_percentage: number;
  max_return_percentage: number;
  investment_duration: number;
  is_active: boolean;
  sort_order: number;
  current_price?: number;
  price_change_24h?: number;
}

interface FormData {
  coingecko_id: string;
  quote_symbol: "USDT" | "BTC" | "ETH";
  min_investment: number;
  max_investment: number;
  min_return_percentage: number;
  max_return_percentage: number;
  investment_duration: number;
  is_active: boolean;
  sort_order?: number;
}

export default function AdminTradingPairsPage() {
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [tradingPairs, setTradingPairs] = useState<TradingPair[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingPrices, setFetchingPrices] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<FormData>({
    defaultValues: {
      quote_symbol: "USDT",
      is_active: true,
      sort_order: 0,
    },
  });

  useEffect(() => {
    // Fetch user data from cookies
    const userData = Cookies.get("user_data");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }

    // Fetch trading pairs
    fetchTradingPairs();
  }, []);

  const fetchTradingPairs = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/trading-pairs`);
      const pairs = response.data.data || [];
      setTradingPairs(pairs);
      await fetchCurrentPrices(pairs);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch trading pairs.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentPrices = async (pairs: TradingPair[]) => {
    setFetchingPrices(true);
    try {
      const ids = pairs.map((pair) => pair.coingecko_id).join(",");
      const response = await axios.get(`https://api.coingecko.com/api/v3/coins/markets`, {
        params: {
          vs_currency: "usd",
          ids,
        },
      });
      const priceMap = new Map(
        response.data.map((coin: any) => [
          coin.id,
          {
            current_price: coin.current_price,
            price_change_24h: coin.price_change_percentage_24h,
          },
        ])
      );
      setTradingPairs(
        pairs.map((pair) => ({
          ...pair,
          current_price: priceMap.get(pair.coingecko_id)?.current_price,
          price_change_24h: priceMap.get(pair.coingecko_id)?.price_change_24h,
        }))
      );
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch current prices from CoinGecko.",
        variant: "destructive",
      });
    } finally {
      setFetchingPrices(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/admin/trading-pairs`, data);
      toast({
        title: "Success",
        description: "Trading pair created successfully.",
        className: "bg-primary text-primary-foreground",
      });
      setTradingPairs((prev) => [...prev, response.data.data]);
      reset();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to create trading pair.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const activeTrades = tradingPairs.filter((pair) => pair.is_active);

  // Stats for the dashboard
  const stats = [
    { label: "Total Trading Pairs", value: tradingPairs.length, icon: Activity, color: "text-primary" },
    { label: "Active Pairs", value: activeTrades.length, icon: TrendingUp, color: "text-secondary" },
    { label: "Average Min Investment", value: tradingPairs.length ? `$${Math.round(tradingPairs.reduce((sum, pair) => sum + pair.min_investment, 0) / tradingPairs.length)}` : "$0", icon: DollarSign, color: "text-primary" },
    { label: "Average Return %", value: tradingPairs.length ? `${Math.round(tradingPairs.reduce((sum, pair) => sum + (pair.min_return_percentage + pair.max_return_percentage) / 2, 0) / tradingPairs.length)}%` : "0%", icon: TrendingUp, color: "text-secondary" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <NavHeader isAuthenticated />

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {user?.name || "Admin"}
          </h1>
          <p className="text-muted-foreground">Manage trading pairs and monitor market activity</p>
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
          {/* Add Trading Pair */}
          <Card className="lg:col-span-1 bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-primary" />
                Add New Trading Pair
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Create a new trading pair for the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="coingecko_id" className="text-foreground">CoinGecko ID</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="coingecko_id"
                      placeholder="e.g., bitcoin"
                      className="pl-10 bg-background border-input text-foreground"
                      {...register("coingecko_id", { required: true, pattern: /^[a-z0-9-]+$/ })}
                    />
                    {errors.coingecko_id && (
                      <p className="text-sm text-destructive">Invalid CoinGecko ID</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quote_symbol" className="text-foreground">Quote Symbol</Label>
                  <Select
                    onValueChange={(value) => setValue("quote_symbol", value as "USDT" | "BTC" | "ETH")}
                    defaultValue="USDT"
                  >
                    <SelectTrigger className="bg-background border-input text-foreground">
                      <SelectValue placeholder="Select quote symbol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USDT">USDT</SelectItem>
                      <SelectItem value="BTC">BTC</SelectItem>
                      <SelectItem value="ETH">ETH</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.quote_symbol && (
                    <p className="text-sm text-destructive">Quote symbol is required</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="min_investment" className="text-foreground">Min Investment</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="min_investment"
                      type="number"
                      placeholder="0"
                      className="pl-10 bg-background border-input text-foreground"
                      {...register("min_investment", { required: true, min: 0 })}
                    />
                    {errors.min_investment && (
                      <p className="text-sm text-destructive">Minimum investment must be >= 0</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_investment" className="text-foreground">Max Investment</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="max_investment"
                      type="number"
                      placeholder="0"
                      className="pl-10 bg-background border-input text-foreground"
                      {...register("max_investment", {
                        required: true,
                        validate: (value, formValues) => value > formValues.min_investment,
                      })}
                    />
                    {errors.max_investment && (
                      <p className="text-sm text-destructive">
                        Max investment must be greater than min investment
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="min_return_percentage" className="text-foreground">Min Return %</Label>
                  <div className="relative">
                    <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="min_return_percentage"
                      type="number"
                      placeholder="0"
                      className="pl-10 bg-background border-input text-foreground"
                      {...register("min_return_percentage", { required: true, min: 0, max: 100 })}
                    />
                    {errors.min_return_percentage && (
                      <p className="text-sm text-destructive">Must be between 0 and 100</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_return_percentage" className="text-foreground">Max Return %</Label>
                  <div className="relative">
                    <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="max_return_percentage"
                      type="number"
                      placeholder="0"
                      className="pl-10 bg-background border-input text-foreground"
                      {...register("max_return_percentage", {
                        required: true,
                        min: 0,
                        max: 100,
                        validate: (value, formValues) => value >= formValues.min_return_percentage,
                      })}
                    />
                    {errors.max_return_percentage && (
                      <p className="text-sm text-destructive">
                        Must be between 0 and 100, >= min return
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="investment_duration" className="text-foreground">Investment Duration (days)</Label>
                  <Input
                    id="investment_duration"
                    type="number"
                    placeholder="1"
                    className="bg-background border-input text-foreground"
                    {...register("investment_duration", { required: true, min: 1 })}
                  />
                  {errors.investment_duration && (
                    <p className="text-sm text-destructive">Must be at least 1 day</p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    {...register("is_active")}
                    defaultChecked={true}
                    className="data-[state=checked]:bg-primary"
                  />
                  <Label htmlFor="is_active" className="text-foreground">Active</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sort_order" className="text-foreground">Sort Order</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    placeholder="0"
                    className="bg-background border-input text-foreground"
                    {...register("sort_order", { min: 0 })}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                  disabled={loading}
                >
                  <PlusCircle className="h-4 w-4" />
                  {loading ? "Adding Pair..." : "Add Trading Pair"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Quick Actions</CardTitle>
              <CardDescription className="text-muted-foreground">Navigate to key admin features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/admin/users">
                <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                  <Users className="h-4 w-4 text-primary" />
                  Manage Users
                </Button>
              </Link>
              <Link href="/admin/trades">
                <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                  <TrendingUp className="h-4 w-4 text-secondary" />
                  View All Trades
                </Button>
              </Link>
              <Link href="/admin/settings">
                <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                  <Shield className="h-4 w-4 text-primary" />
                  Platform Settings
                </Button>
              </Link>
              <Link href="/admin/support">
                <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                  <MessageSquare className="h-4 w-4 text-secondary" />
                  Support Tickets
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* All Trading Pairs */}
        <Card className="mt-6 bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              All Trading Pairs
            </CardTitle>
            <CardDescription className="text-muted-foreground">View and manage all trading pairs</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : (
              <div className="space-y-3">
                {tradingPairs.map((pair) => (
                  <div key={pair.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">{pair.base_symbol[0]}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{pair.base_name}</p>
                        <p className="text-sm text-muted-foreground">{pair.base_symbol}/{pair.quote_symbol}</p>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="font-semibold text-foreground">{fetchingPrices ? "Fetching..." : pair.current_price?.toFixed(2) ?? "N/A"} USD</p>
                      <p className={`text-sm ${pair.price_change_24h && pair.price_change_24h >= 0 ? "text-primary" : "text-destructive"}`}>
                        {fetchingPrices ? "Fetching..." : pair.price_change_24h ? `${pair.price_change_24h.toFixed(2)}%` : "N/A"}
                      </p>
                      <Badge
                        variant={pair.is_active ? "default" : "secondary"}
                        className={
                          pair.is_active
                            ? "bg-primary/10 text-primary hover:bg-primary/20"
                            : "bg-secondary/10 text-secondary hover:bg-secondary/20"
                        }
                      >
                        {pair.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Trading Pairs */}
        <Card className="mt-6 bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Active Trading Pairs
            </CardTitle>
            <CardDescription className="text-muted-foreground">Currently active trading pairs</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : (
              <div className="space-y-3">
                {activeTrades.map((pair) => (
                  <div key={pair.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">{pair.base_symbol[0]}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{pair.base_name}</p>
                        <p className="text-sm text-muted-foreground">{pair.base_symbol}/{pair.quote_symbol}</p>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="font-semibold text-foreground">{fetchingPrices ? "Fetching..." : pair.current_price?.toFixed(2) ?? "N/A"} USD</p>
                      <p className={`text-sm ${pair.price_change_24h && pair.price_change_24h >= 0 ? "text-primary" : "text-destructive"}`}>
                        {fetchingPrices ? "Fetching..." : pair.price_change_24h ? `${pair.price_change_24h.toFixed(2)}%` : "N/A"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Link href="/admin/trades">
              <Button variant="outline" className="w-full mt-4 bg-transparent gap-2">
                <TrendingUp className="h-4 w-4" />
                View All Trades
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
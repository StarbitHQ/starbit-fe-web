"use client";

import { API_BASE_URL } from "@/lib/api";
import { NavHeader } from "@/components/admin-nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { PlusCircle, DollarSign, TrendingUp, Activity, CheckCircle2, Users, Shield, MessageSquare, Clock, Trash2 } from "lucide-react";
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

interface ActiveUser {
  id: number;
  name: string;
  email: string;
  active_trades_count: number;
}

interface Stats {
  total_pairs: number;
  active_pairs: number;
  avg_min_investment: number;
  avg_return_percentage: number;
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
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [stats, setStats] = useState<Stats>({
    total_pairs: 0,
    active_pairs: 0,
    avg_min_investment: 0,
    avg_return_percentage: 0,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fetchingPrices, setFetchingPrices] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const usersPerPage = 5;

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

    // Fetch initial data
    fetchAllData();
  }, []);

  useEffect(() => {
    // Fetch active users when page changes
    fetchActiveUsers(currentPage);
  }, [currentPage]);

  const fetchAllData = async () => {
    await Promise.all([
      fetchTradingPairs(),
      fetchStats(),
      fetchActiveUsers(currentPage),
    ]);
  };

  const getAuthHeaders = () => {
    const token = Cookies.get("auth_token");
    if (!token) {
      throw new Error("No authentication token found. Please log in.");
    }
    return {
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchTradingPairs = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/trading-pairs`, {
        headers: getAuthHeaders(),
      });

      if (response.data.success) {
        const pairs = response.data.data || [];
        setTradingPairs(pairs);
        // Fetch prices on client side
        await fetchCurrentPrices(pairs);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to fetch trading pairs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/trading-pairs/stats`, {
        headers: getAuthHeaders(),
      });

      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error: any) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchCurrentPrices = async (pairs: TradingPair[]) => {
    if (pairs.length === 0) return;
    
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
      
      setTradingPairs((prevPairs) =>
        prevPairs.map((pair) => ({
          ...pair,
          current_price: priceMap.get(pair.coingecko_id)?.current_price,
          price_change_24h: priceMap.get(pair.coingecko_id)?.price_change_24h,
        }))
      );
    } catch (error) {
      toast({
        title: "Warning",
        description: "Failed to fetch current prices from CoinGecko",
        variant: "default",
      });
    } finally {
      setFetchingPrices(false);
    }
  };

  const fetchActiveUsers = async (page: number) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/active-users`, {
        headers: getAuthHeaders(),
        params: {
          page,
          per_page: usersPerPage,
        },
      });

      if (response.data.success) {
        setActiveUsers(response.data.data || []);
        setTotalPages(response.data.meta?.last_page || 1);
      }
    } catch (error: any) {
      setActiveUsers([]);
      // Don't show error toast for empty users list
      if (error.response?.status !== 404) {
        console.error("Error fetching active users:", error);
      }
    }
  };

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      // First verify the coin exists
      const verifyResponse = await axios.get(
        `${API_BASE_URL}/api/admin/verify-coin/${data.coingecko_id}`,
        { headers: getAuthHeaders() }
      );

      if (!verifyResponse.data.success) {
        throw new Error("Invalid CoinGecko ID");
      }

      // Create the trading pair
      const response = await axios.post(
        `${API_BASE_URL}/api/admin/trading-pairs`,
        data,
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Trading pair created successfully",
          className: "bg-primary text-primary-foreground",
        });
        
        reset();
        await fetchAllData();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to create trading pair",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePair = async (id: number) => {
    if (!confirm("Are you sure you want to delete this trading pair?")) return;

    try {
      const response = await axios.delete(
        `${API_BASE_URL}/api/admin/trading-pairs/${id}`,
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Trading pair deleted successfully",
        });
        await fetchAllData();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to delete trading pair",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/admin/trading-pairs/${id}`,
        { is_active: !currentStatus },
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        toast({
          title: "Success",
          description: `Trading pair ${!currentStatus ? "activated" : "deactivated"}`,
        });
        await fetchAllData();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update trading pair",
        variant: "destructive",
      });
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const activeTrades = tradingPairs.filter((pair) => pair.is_active);

  // Stats for the dashboard
  const displayStats = [
    { label: "Total Trading Pairs", value: stats.total_pairs, icon: Activity, color: "text-primary" },
    { label: "Active Pairs", value: stats.active_pairs, icon: TrendingUp, color: "text-secondary" },
    { label: "Average Min Investment", value: `$${Math.round(stats.avg_min_investment)}`, icon: DollarSign, color: "text-primary" },
    { label: "Average Return %", value: `${Math.round(stats.avg_return_percentage)}%`, icon: TrendingUp, color: "text-secondary" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <NavHeader isAuthenticated />

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {user?.name || "Admin"}
          </h1>
          <p className="text-muted-foreground">Manage trading pairs and monitor market activity</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {displayStats.map((stat) => (
            <Card key={stat.label} className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg bg-muted`}>
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
                      {...register("coingecko_id", { required: "CoinGecko ID is required", pattern: { value: /^[a-z0-9-]+$/, message: "Invalid CoinGecko ID format" } })}
                    />
                    {errors.coingecko_id && (
                      <p className="text-sm text-destructive mt-1">{errors.coingecko_id.message}</p>
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="min_investment" className="text-foreground">Min Investment</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="min_investment"
                      type="number"
                      step="0.01"
                      placeholder="0"
                      className="pl-10 bg-background border-input text-foreground"
                      {...register("min_investment", { required: "Minimum investment is required", min: { value: 0, message: "Minimum investment must be >= 0" }, valueAsNumber: true })}
                    />
                    {errors.min_investment && (
                      <p className="text-sm text-destructive mt-1">{errors.min_investment.message}</p>
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
                      step="0.01"
                      placeholder="0"
                      className="pl-10 bg-background border-input text-foreground"
                      {...register("max_investment", {
                        required: "Maximum investment is required",
                        valueAsNumber: true,
                        validate: (value, formValues) => value > formValues.min_investment || "Max investment must be greater than min investment",
                      })}
                    />
                    {errors.max_investment && (
                      <p className="text-sm text-destructive mt-1">{errors.max_investment.message}</p>
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
                      step="0.01"
                      placeholder="0"
                      className="pl-10 bg-background border-input text-foreground"
                      {...register("min_return_percentage", {
                        required: "Minimum return percentage is required",
                        min: { value: 0, message: "Must be >= 0" },
                        max: { value: 1000000000, message: "Must be <= 1000000000" },
                        valueAsNumber: true,
                      })}
                    />
                    {errors.min_return_percentage && (
                      <p className="text-sm text-destructive mt-1">{errors.min_return_percentage.message}</p>
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
                      step="0.01"
                      placeholder="0"
                      className="pl-10 bg-background border-input text-foreground"
                      {...register("max_return_percentage", {
                        required: "Maximum return percentage is required",
                        min: { value: 0, message: "Must be >= 0" },
                        max: { value: 100, message: "Must be <= 100" },
                        valueAsNumber: true,
                        validate: (value, formValues) => value >= formValues.min_return_percentage || "Max return must be >= min return",
                      })}
                    />
                    {errors.max_return_percentage && (
                      <p className="text-sm text-destructive mt-1">{errors.max_return_percentage.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="investment_duration" className="text-foreground">Investment Duration (days)</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="investment_duration"
                      type="number"
                      placeholder="1"
                      className="pl-10 bg-background border-input text-foreground"
                      {...register("investment_duration", {
                        required: "Investment duration is required",
                        min: { value: 1, message: "Must be at least 1 day" },
                        valueAsNumber: true,
                      })}
                    />
                    {errors.investment_duration && (
                      <p className="text-sm text-destructive mt-1">{errors.investment_duration.message}</p>
                    )}
                  </div>
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
                    {...register("sort_order", { min: { value: 0, message: "Sort order must be >= 0" }, valueAsNumber: true })}
                  />
                  {errors.sort_order && (
                    <p className="text-sm text-destructive mt-1">{errors.sort_order.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                  disabled={submitting}
                >
                  <PlusCircle className="h-4 w-4" />
                  {submitting ? "Adding Pair..." : "Add Trading Pair"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Active Users in Trades */}
          <Card className="lg:col-span-2 bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Active Users in Trades
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Users currently participating in active trades
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeUsers.length === 0 ? (
                <p className="text-muted-foreground">No users on trades yet.</p>
              ) : (
                <>
                  <div className="space-y-3">
                    {activeUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-bold text-primary">{user.name[0]}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                            {user.active_trades_count} Active Trade{user.active_trades_count !== 1 ? "s" : ""}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                  {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-4">
                      <Button
                        variant="outline"
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                        className="bg-transparent"
                      >
                        Previous
                      </Button>
                      <p className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages}
                      </p>
                      <Button
                        variant="outline"
                        disabled={currentPage === totalPages}
                        onClick={() => handlePageChange(currentPage + 1)}
                        className="bg-transparent"
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="lg:col-span-3 bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Quick Actions</CardTitle>
              <CardDescription className="text-muted-foreground">Navigate to key admin features</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
            ) : tradingPairs.length === 0 ? (
              <p className="text-muted-foreground">No trading pairs available.</p>
            ) : (
              <div className="space-y-3">
                {tradingPairs.map((pair) => (
                  <div key={pair.id} className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          {pair.base_icon_url ? (
                            <img src={pair.base_icon_url} alt={pair.base_symbol} className="h-8 w-8 rounded-full" />
                          ) : (
                            <span className="text-sm font-bold text-primary">{pair.base_symbol[0]}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{pair.base_name}</p>
                          <p className="text-sm text-muted-foreground">{pair.base_symbol}/{pair.quote_symbol}</p>
                        </div>
                      </div>
                      <div className="text-right space-y-1 flex items-center gap-3">
                        <div>
                          <p className="font-semibold text-foreground">
                            {fetchingPrices ? "..." : pair.current_price ? `${pair.current_price.toFixed(2)}` : "N/A"}
                          </p>
                          <p className={`text-sm ${pair.price_change_24h && pair.price_change_24h >= 0 ? "text-green-500" : "text-red-500"}`}>
                            {fetchingPrices ? "..." : pair.price_change_24h ? `${pair.price_change_24h > 0 ? "+" : ""}${pair.price_change_24h.toFixed(2)}%` : "N/A"}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleActive(pair.id, pair.is_active)}
                          >
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
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeletePair(pair.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                      <p>Min Investment: ${pair.min_investment}</p>
                      <p>Max Investment: ${pair.max_investment}</p> 
                      <p>Return: {pair.min_return_percentage}% - {pair.max_return_percentage}%</p>
                      <p>Duration: {pair.investment_duration} day{pair.investment_duration !== 1 ? "s" : ""}</p>
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
            ) : activeTrades.length === 0 ? (
              <p className="text-muted-foreground">No active trading pairs available.</p>
            ) : (
              <div className="space-y-3">
                {activeTrades.map((pair) => (
                  <div key={pair.id} className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          {pair.base_icon_url ? (
                            <img src={pair.base_icon_url} alt={pair.base_symbol} className="h-8 w-8 rounded-full" />
                          ) : (
                            <span className="text-sm font-bold text-primary">{pair.base_symbol[0]}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{pair.base_name}</p>
                          <p className="text-sm text-muted-foreground">{pair.base_symbol}/{pair.quote_symbol}</p>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="font-semibold text-foreground">
                          {fetchingPrices ? "..." : pair.current_price ? `${pair.current_price.toFixed(2)}` : "N/A"}
                        </p>
                        <p className={`text-sm ${pair.price_change_24h && pair.price_change_24h >= 0 ? "text-green-500" : "text-red-500"}`}>
                          {fetchingPrices ? "..." : pair.price_change_24h ? `${pair.price_change_24h > 0 ? "+" : ""}${pair.price_change_24h.toFixed(2)}%` : "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                      <p>Min Investment: ${pair.min_investment}</p>
                      <p>Max Investment: ${pair.max_investment}</p> 
                      <p>Return: {pair.min_return_percentage}% - {pair.max_return_percentage}%</p>
                      <p>Duration: {pair.investment_duration} day{pair.investment_duration !== 1 ? "s" : ""}</p>
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